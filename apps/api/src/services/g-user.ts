import { db } from '@/lib/drizzle';
import { env } from '@/lib/env';
import { gUserTable } from '@/schemas/db';
import { generateSlug } from 'random-word-slugs';
import { z } from 'zod';

const tokenResponseSchema = z.object({
  authToken: z.string(),
  username: z.string(),
  dataSource: z.string(),
  availableDataSources: z.array(z.string()),
});

const userResponseSchema = z.object({
  username: z.string(),
  password: z.string(),
  attributes: z.object({
    'guac-organizational-role': z.string(),
    'guac-full-name': z.string(),
    expired: z.string(),
    timezone: z.string().nullable(),
    'access-window-start': z.string(),
    'guac-organization': z.string(),
    'access-window-end': z.string(),
    disabled: z.string(),
    'valid-until': z.string(),
    'valid-from': z.string(),
  }),
});

const g_admin = {
  username: 'guacadmin',
  password: 'guacadmin',
};

const createTokenOptions = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: Object.keys(g_admin)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(g_admin[key as keyof typeof g_admin])}`)
    .join('&'),
};

const createUserOptions = (username: string, password: string) => ({
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username,
    password,
    attributes: {
      disabled: '',
      expired: '',
      'access-window-start': '',
      'access-window-end': '',
      'valid-from': '',
      'valid-until': '',
      timezone: null,
      'guac-full-name': '',
      'guac-organization': '',
      'guac-organizational-role': '',
    },
  }),
});

const createConnectionOptions = (username: string, password: string) => ({
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    parentIdentifier: 'ROOT',
    name: `${username}_test`,
    protocol: 'ssh',
    parameters: {
      port: '22',
      'read-only': '',
      'swap-red-blue': '',
      cursor: '',
      'color-depth': '',
      'clipboard-encoding': '',
      'disable-copy': '',
      'disable-paste': '',
      'dest-port': '',
      'recording-exclude-output': '',
      'recording-exclude-mouse': '',
      'recording-include-keys': '',
      'create-recording-path': '',
      'enable-sftp': '',
      'sftp-port': '',
      'sftp-server-alive-interval': '',
      'enable-audio': '',
      'color-scheme': '',
      'font-size': '',
      scrollback: '',
      timezone: null,
      'server-alive-interval': '',
      backspace: '',
      'terminal-type': '',
      'create-typescript-path': '',
      hostname: 'localhost',
      'host-key': '',
      'private-key': '',
      username: 'user02', // TODO: Change the username to linux user
      password: 'User02', // TODO: Change the password to linux user's password
      passphrase: '',
      'font-name': '',
      command: '',
      locale: '',
      'typescript-path': '',
      'typescript-name': '',
      'recording-path': '',
      'recording-name': '',
      'sftp-root-directory': '',
    },
    attributes: {
      'max-connections': '10',
      'max-connections-per-user': '10',
      weight: '',
      'failover-only': '',
      'guacd-port': '',
      'guacd-encryption': '',
      'guacd-hostname': '',
    },
  }),
});

const createConnectionResponseSchema = z.object({
  identifier: z.string(),
});

const createPermissionOptions = (identifier: string) => ({
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify([
    {
      op: 'add',
      path: `/connectionPermissions/${identifier}`,
      value: 'READ',
    },
  ]),
});

export async function createGUser(userId: number) {
  // G_user and password
  const username = generateSlug();
  const password = generateSlug();

  console.log('Random username and password', username, password);

  // Add username and password to the database
  await db.insert(gUserTable).values({ userId, username, password });

  fetch(`${env.GUACAMOLE_SERVER_URL}/api/tokens`, createTokenOptions)
    .then((res) => res.json())
    .then((data) => {
      console.log('Token response', data);
      const parsedData = tokenResponseSchema.safeParse(data);
      if (!parsedData.success) {
        throw new Error('Failed to parse token response');
      }
      return parsedData.data;
    })
    .then(async (parsedData) => {
      const res = await fetch(
        `${env.GUACAMOLE_SERVER_URL}/api/session/data/${parsedData.dataSource}/users?token=${parsedData.authToken}`,
        createUserOptions(username, password),
      );

      const data = await res.json();

      const parsedUserData = userResponseSchema.safeParse(data);
      if (!parsedUserData.success) {
        throw new Error('Failed to parse user response');
      }
      console.log('User response', data);
      return { parsedUserData: parsedUserData.data, parsedTokenData: parsedData };
    })
    .then(async (input) => {
      const { parsedUserData, parsedTokenData } = input;
      const res = await fetch(
        `${env.GUACAMOLE_SERVER_URL}/api/session/data/${parsedTokenData.dataSource}/connections?token=${parsedTokenData.authToken}`,
        createConnectionOptions(username, password),
      );

      const data = await res.json();

      console.log('Connection response', data);

      const parsedConnectionData = createConnectionResponseSchema.safeParse(data);
      if (!parsedConnectionData.success) {
        throw new Error('Failed to parse connection response');
      }

      return { connectionData: parsedConnectionData.data, ...input };
    })
    .then(async (input) => {
      const { connectionData, parsedTokenData, parsedUserData } = input;

      const res = await fetch(
        `${env.GUACAMOLE_SERVER_URL}/api/session/data/${parsedTokenData.dataSource}/users/${parsedUserData.username}/permissions?token=${parsedTokenData.authToken}`,
        createPermissionOptions(connectionData.identifier),
      );

      // const data = await res.json();

      console.log('Permission granted');
    })
    .catch((err) => {
      console.log('Failed to create g_user');
      console.error(err);
    });
}
