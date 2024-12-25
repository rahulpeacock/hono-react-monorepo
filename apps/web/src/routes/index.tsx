import { Button } from '@kittyo/ui/button';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <div className='bg-red-200'>
        <p>Hello form</p>
        <Button asChild>
          <Link to='/about'>About</Link>
        </Button>
      </div>
    </div>
  );
}
