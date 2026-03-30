import Link from "next/link";

export default function TopNav(){
    return (
        <nav>
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
            <Link href="/cats">Cats</Link>
        </nav>
    )
}