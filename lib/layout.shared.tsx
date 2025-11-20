import logo from "@/app/icon.png";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";

const TITLE = "Ripple Effect";
const SIZE = 40;
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="flex items-center justify-center gap-1">
          <Image src={logo} alt="logo" width={SIZE} height={SIZE} />
          <span className="text-xl font-bold">{TITLE}</span>
        </span>
      ),
    },
  };
}
