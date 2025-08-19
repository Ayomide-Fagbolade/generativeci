import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function Header() {
  return (
    <div className="flex flex-col gap-24 items-center"> {/* Increased gap to 24 */}
      <div className="flex gap-8 justify-center items-center">
        <a
          href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
          target="_blank"
          rel="noreferrer"
        >
          <Image
            src="/um6pSci.png"
            alt="UM6P Logo"
            width={480}
            height={160}
            className="h-24 w-auto"
          />
        </a>
      </div>

      {/* Added margin-bottom to the heading */}
      <h1 className="text-3xl lg:text-4xl font-bold text-center mb-8">
        Join the Collective Storytelling Adventure!
      </h1>

      {/* Added margin-bottom to the paragraph */}
      <p className="text-xl lg:text-2xl text-center mb-12">
        Vote on your favorite story elements and shape the narrative together!
      </p>

      {/* Added margin-top to the button container */}
      <div className="flex justify-center mt-8">
        <Link href="/user">
          <Button>
            Vote now
          </Button>
        </Link>
      </div>
    </div>
  );
}