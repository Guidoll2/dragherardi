import { UserButton } from "@clerk/nextjs";
import { FaUserDoctor } from "react-icons/fa6";
import Link from "next/link";

function Header() {
  return (
    <header className="flex flex-row p-4 bg-gray-100 justify-between">
      <Link href={"/"}>
        <div className="z-[100]">
          <FaUserDoctor />
        </div>
      </Link>

      <div>
        <UserButton />
      </div>
    </header>
  );
}

export default Header;
