import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <section>
      <h1 className="text-center text-3xl">Welcome to the Cat Calendar Creator!</h1>
      <figure className="my-3 text-center">
        {/* <img src="/CatSplash.png" alt="cat holding a calendar" className="mx-auto max-h-[70vh]" /> */}
        <Image className="mx-auto max-h-[70vh]" src="/CatSplash.png" alt="welcome" width={455} height={737} priority />
      </figure>
      <p className="text-center">
        <Link href="/browse" className="underline underline-offset-4">
          Browse
        </Link>{' '}
        cat pictures or{' '}
        <Link href="/upload" className="underline underline-offset-4">
          upload
        </Link>{' '}
        your own and create a calendar with them.
      </p>
    </section>
  );
}
