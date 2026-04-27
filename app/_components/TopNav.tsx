import Link from "next/link";
import Image from "next/image";

const links = [
		{ href: '/browse', label: 'Browse' },
		{ href: '/upload', label: 'Upload' },
		{ href: '/favorites', label: 'Favorites' },
		{ href: '/calendar', label: 'Calendar' }
	] as const;

export default function TopNav(){
    return (
        <div className="no-print navbar sticky top-0 z-50 bg-base-200 shadow-sm">
            <div className="navbar-start">
                <Link href='/' className="fancy-font btn text-xl font-bold btn-ghost">
                    <Image
                        src="/CatCalendarCreator_h.png"
                        alt="cat calendar creator"
                        height={40}
                        width={102}
                        priority
                    />
                </Link>
            </div>
            <div className="navbar-center hidden md:flex">
                <ul className="menu menu-horizontal gap-1 px-1">
                    {links.map((link) => {
                        return (
                            <li key={link.href}><Link href={link.href}>{link.label}</Link></li>
                        )
                    })}
                </ul>
            </div>
            <div className="navbar-end md:hidden">
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-circle btn-ghost">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h7"
                            />
                        </svg>
                    </div>
                    <ul className="dropdown-content menu z-10 mt-3 w-52 menu-sm rounded-box bg-base-100 p-2 shadow">
                        {links.map((link) => {
                        return (
                            <li key={link.href}><Link href={link.href}>{link.label}</Link></li>
                        )
                    })}
                    </ul>
                </div>
            </div>
        </div>
    )
}