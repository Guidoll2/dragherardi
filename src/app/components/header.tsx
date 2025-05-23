import { UserButton } from "@clerk/nextjs";
import { FaUserDoctor } from "react-icons/fa6";
import Link from "next/link";

function Header() {
  return (
    <header className="flex flex-row p-2 bg-gray-100 justify-between z-[100]">
      <Link href={"/"}>
        <div className="mt-2 z-[100]">
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
