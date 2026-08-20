type SectionIntroProps = {
  eyebrow?: string;
  title: string;
  body?: string;
  dark?: boolean;
  actions?: boolean;
};

export default function SectionIntro({
  eyebrow,
  title,
  body,
  dark = false,
}: SectionIntroProps) {
  // Split title so the final word can be accented
  const words = title.trim().split(/\s+/);
  const lastWord = words.pop();
  const titleBeforeLastWord = words.join(" ");

  return (
    <div className="grid gap-8 md:grid-cols-12">
      <div className="md:col-span-9 lg:col-span-8">
        {eyebrow && (
          <div className="mb-8">
            <p
              className="
                text-[clamp(0.95rem,1.3vw,1.03rem)]
           
                font-medium
                uppercase
                leading-[0.95]
                tracking-[-0.045em]
                text-orange-500
              "
            >
              {eyebrow}
            </p>
          </div>
        )}

        <h2



          className={`
           max-w-[800px]
 text-[clamp(2rem,3.2vw,3.5rem)]
 font-medium
 leading-[1.05]
 tracking-[-0.045em]
 text-[rgb(31,32,33)]
            ${
              dark
                ? "text-white"
                : "text-[rgb(31,32,33)]"
            }
          `}
        >
          {titleBeforeLastWord && (
            <>
              {titleBeforeLastWord}{" "}
            </>
          )}

          <span className="text-orange-500">
            {lastWord}
          </span>
        </h2>

        {body && (
          <p
            className={`
              mt-6
              max-w-[680px]
              text-[14px]
              leading-[1.75]
              tracking-[-0.01em]
              md:text-[16px]
              ${
                dark
                  ? "text-white/60"
                  : "text-black/55"
              }
            `}
          >
            {body}
          </p>
        )}
      </div>
    </div>
  );
}