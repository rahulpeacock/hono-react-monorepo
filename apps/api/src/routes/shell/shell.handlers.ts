import { db } from '@/lib/drizzle';
import { env } from '@/lib/env';
import type { AppRouteHandler } from '@/lib/types';
import { gUserTable } from '@/schemas/db';
import { getCourseFromDB } from '@/services/db/course';
import { getIdentifierBasedOnCourse } from '@/services/db/g_user';
import { getUserEnrolledCourseFromDB } from '@/services/db/user';
import { getCurrentSession } from '@/services/session';
import { eq } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import * as HttpStatusPhrases from 'stoker/http-status-phrases';
import { z } from 'zod';
import type { ShellConnectionRoute } from './shell.routes';

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

const createPermissionOptions = (identifier: number) => ({
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

const tokenResponseSchema = z.object({
  authToken: z.string(),
  username: z.string(),
  dataSource: z.string(),
  availableDataSources: z.array(z.string()),
});

const connectionGroupsResponseSchema = z.object({
  name: z.string(),
  identifier: z.string(),
  type: z.string(),
  activeConnections: z.number(),
  childConnections: z.array(
    z.object({
      name: z.string(),
      identifier: z.string(),
      parentIdentifier: z.string(),
      protocol: z.string(),
      activeConnections: z.number(),
    }),
  ),
});

function encodedPayload(payload: { username: string; password: string }) {
  return Object.keys(payload)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(payload[key as keyof typeof payload])}`)
    .join('&');
}

export const shellConnection: AppRouteHandler<ShellConnectionRoute> = async (c) => {
  const { course_id } = c.req.valid('param');

  const { session, user } = await getCurrentSession(c);
  if (session === null || user === null) {
    return c.json(
      {
        message: 'Not authenticated',
        error: 'Not authenticated',
      },
      HttpStatusCodes.UNAUTHORIZED,
    );
  }

  const enrolledCourse = await getUserEnrolledCourseFromDB(session.userId, course_id);

  if (!enrolledCourse) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }

  const courseInfo = await getCourseFromDB(enrolledCourse.courseId);

  if (!courseInfo) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }

  const result = await db.select().from(gUserTable).where(eq(gUserTable.userId, user.id));

  console.log('Result: ', result);
  if (result.length === 0) {
    return c.json(
      {
        message: 'Not authenticated',
        error: 'Not authenticated',
      },
      HttpStatusCodes.UNAUTHORIZED,
    );
  }

  const res = await fetch(`${env.GUACAMOLE_SERVER_URL}/api/tokens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: encodedPayload({ username: result[0].username, password: result[0].password }),
  });

  const data = await res.json();
  console.log('Guacamole value: ', env.GUACAMOLE_SERVER_URL);
  console.log('data', data);

  const parsedData = tokenResponseSchema.safeParse(data);
  if (!parsedData.success) {
    throw new Error('Failed to parse token response');
  }

  // Get the identifier of a connection
  const connection = await getIdentifierBasedOnCourse(JSON.parse(courseInfo.categories)[0] || 'linux', result[0].id);

  if (connection === null) {
    return c.json({ authToken: parsedData.data.authToken }, HttpStatusCodes.TOO_MANY_REQUESTS);
  }

  const parsedTokenData = await fetch(`${env.GUACAMOLE_SERVER_URL}/api/tokens`, createTokenOptions)
    .then((res) => res.json())
    .then((data) => {
      console.log('Token response', data);
      const parsedData = tokenResponseSchema.safeParse(data);
      if (!parsedData.success) {
        throw new Error('Failed to parse token response');
      }
      return parsedData.data;
    });

  // Grant the user access to the connection
  await fetch(
    `${env.GUACAMOLE_SERVER_URL}/api/session/data/${parsedTokenData.dataSource}/users/${result[0].username}/permissions?token=${parsedTokenData.authToken}`,
    createPermissionOptions(connection.identifier),
  );

  // const connectionGroupsRes = await fetch(
  //   `${env.GUACAMOLE_SERVER_URL}/api/session/data/${parsedData.data.dataSource}/connectionGroups/ROOT/tree?token=${parsedData.data.authToken}`,
  // );

  // const connectionGroupsData = await connectionGroupsRes.json();

  // console.log('connectionGroupsData', connectionGroupsData);

  // const parsedConnectionData = connectionGroupsResponseSchema.safeParse(connectionGroupsData);
  // if (!parsedConnectionData.success) {
  //   throw new Error('Failed to parse connection response');
  // }

  // if (parsedConnectionData.data.childConnections.length === 0) {
  //   throw new Error('No connection found');
  // }

  // console.log({ authToken: parsedData.data.authToken, identifier: parsedConnectionData.data.childConnections[0].identifier });

  return c.json({ authToken: parsedData.data.authToken, identifier: connection.identifier }, 200);
};
