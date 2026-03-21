import Link from "next/link";

interface LogoProps {
  href?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: {
    box: "w-6 h-6",
    text: "text-base",
    gap: "gap-1",
  },
  md: {
    box: "w-8 h-8",
    text: "text-xl",
    gap: "gap-2",
  },
  lg: {
    box: "w-10 h-10",
    text: "text-2xl",
    gap: "gap-3",
  },
};

export function Logo({ href = "/", showText = true, size = "md" }: LogoProps) {
  const sizes = sizeClasses[size];

  const logoContent = (
    <div className={`flex items-center ${sizes.gap}`}>
      <div
        className={`${sizes.box} rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0`}
      >
        <span className={`${sizes.text} font-bold text-white`}>₿</span>
      </div>

      {showText && (
        <span className={`${sizes.text} font-bold`}>
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            LUME MEI
          </span>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
