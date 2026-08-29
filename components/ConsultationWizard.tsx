"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
} from "lucide-react";

const steps = [
  "Overview",
  "Budget",
  "Details",
  "Confirm",
] as const;

const inputClass = `
  mt-3
  min-h-12
  w-full
  border
  border-black/15
  bg-white/85
  px-4
  py-3.5
  text-[15px]
  text-[rgb(31,32,33)]
  outline-none
  transition-all
  duration-200
  placeholder:text-black/30
  hover:border-black/30
  focus:border-orange-500
  focus:bg-white
  focus:ring-4
  focus:ring-orange-500/10
  md:py-4
`;

export default function ConsultationWizard() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <section
        className="
          relative
          flex
          min-h-[80vh]
          items-center
          overflow-hidden
          bg-[#071F2D]
          px-5
          py-20
          text-white
          sm:px-6
          md:py-28
        "
      >
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            bg-[radial-gradient(circle_at_50%_35%,rgba(249,115,22,0.12),transparent_30%)]
          "
        />

        <div className="relative mx-auto w-full max-w-3xl text-center">
          <div
            className="
              mx-auto
              grid
              h-14
              w-14
              place-items-center
              rounded-full
              bg-orange-500
              text-white
              sm:h-16
              sm:w-16
            "
          >
            <Check size={25} strokeWidth={2} />
          </div>

          <p
            className="
              mt-7
              text-[9px]
              font-medium
              uppercase
              tracking-[0.2em]
              text-white/40
              sm:text-[10px]
            "
          >
            Consultation received
          </p>

          <h1
            className="
              mt-5
              text-[clamp(2.3rem,10vw,5.6rem)]
              font-medium
              leading-[0.96]
              tracking-[-0.05em]
            "
          >
            Your request is{" "}
            <span className="text-orange-500">
              captured.
            </span>
          </h1>

          <p
            className="
              mx-auto
              mt-6
              max-w-xl
              text-[15px]
              leading-[1.75]
              text-white/55
              sm:text-[16px]
            "
          >
            This demo does not transmit data yet. Connect the final submit
            action to your CRM, form service, or API endpoint when you&apos;re
            ready to make it live.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-visible bg-[#F7F9FA]">
      <div
        className="
          container-site
          grid
          min-h-[calc(100vh-80px)]
          gap-0
          md:grid-cols-12
          lg:px-10
        "
      >
        {/* LEFT / MOBILE PROGRESS */}
        <aside
          className="
            border-b
            border-black/10
            py-6
            md:col-span-4
            md:border-b-0
            md:border-r
            md:py-16
            lg:col-span-3
            lg:pr-10
          "
        >
          <div className="hidden md:sticky md:top-28 md:block">
          

            {/* Steps */}
            <div
              className="
                mt-6
                grid
                grid-cols-4
                gap-2
                md:mt-14
                md:block
                md:space-y-2
              "
            >
              {steps.map((label, index) => {
                const current = index === step;
                const completed = index < step;

                return (
                  <div
                    key={label}
                    className={`
                      relative
                      border-t
                      pt-3
                      transition-colors
                      duration-300

                      md:flex
                      md:items-center
                      md:gap-4
                      md:py-4

                      ${
                        current
                          ? "border-orange-500"
                          : "border-black/10"
                      }
                    `}
                  >
                    <span
                      className={`
                        grid
                        h-8
                        w-8
                        shrink-0
                        place-items-center
                        rounded-full
                        border
                        text-[9px]
                        font-medium
                        transition-all
                        duration-300
                        sm:text-[10px]

                        ${
                          completed
                            ? "border-[rgb(31,32,33)] bg-[rgb(31,32,33)] text-white"
                            : current
                              ? "border-orange-500 bg-orange-500 text-white"
                              : "border-black/15 text-black/35"
                        }
                      `}
                    >
                      {completed ? (
                        <Check size={13} />
                      ) : (
                        String(index + 1).padStart(2, "0")
                      )}
                    </span>

                    <div className="mt-2 min-w-0 md:mt-0">
                      <p
                        className={`
                          truncate
                          text-[8px]
                          font-medium
                          uppercase
                          tracking-[0.08em]
                          transition-colors
                          duration-300
                          sm:text-[9px]
                          md:text-[12px]
                          md:tracking-[0.14em]

                          ${
                            current
                              ? "text-[rgb(31,32,33)]"
                              : completed
                                ? "text-black/60"
                                : "text-black/35"
                          }
                        `}
                      >
                        {label}
                      </p>

                      {current && (
                        <p className="mt-1 hidden text-[11px] text-black/40 md:block">
                          Step {index + 1} of {steps.length}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Progress */}
            <div className="mt-7 md:mt-10">
              <div className="flex items-center justify-between">
                <span
                  className="
                    text-[8px]
                    font-medium
                    uppercase
                    tracking-[0.16em]
                    text-black/35
                    sm:text-[9px]
                  "
                >
                  Progress
                </span>

                <span
                  className="
                    text-[8px]
                    font-medium
                    uppercase
                    tracking-[0.16em]
                    text-black/45
                    sm:text-[9px]
                  "
                >
                  {Math.round(((step + 1) / steps.length) * 100)}%
                </span>
              </div>

              <div className="mt-3 h-[2px] overflow-hidden bg-black/10">
                <div
                  className="
                    h-full
                    bg-orange-500
                    transition-all
                    duration-500
                    ease-[cubic-bezier(.22,1,.36,1)]
                  "
                  style={{
                    width: `${((step + 1) / steps.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <p
              className="
                mt-5
                max-w-[250px]
                text-[11px]
                leading-[1.6]
                text-black/40
                md:mt-8
                md:text-[12px]
              "
            >
              Usually takes under 10 minutes.
            </p>
          </div>
    
        </aside>

        {/* FORM AREA */}
        <div
          className="
            min-w-0
            py-8
            pb-10
            md:col-span-8
            md:py-16
            md:pb-16
            md:pl-10
            lg:col-span-9
            lg:pl-16
          "
        >
          <div className="mx-auto max-w-[950px]">
            {/* Step Header */}
            <div className="border-b border-black/10 pb-7 md:pb-8">
              <p
                className="
                 text-[8px]
                "
              >
                {String(step + 1).padStart(2, "0")} /{" "}
                {String(steps.length).padStart(2, "0")}
              </p>
         

              {step === 0 && (
                <>
                  <StepTitle>
                    Tell us about your
              
                      project.
                  
                  </StepTitle>

                  <StepDescription>
                    A few basics help us understand scope, fit, location, and
                    timing.
                  </StepDescription>
                </>
              )}

              {step === 1 && (
                <>
                  <StepTitle>
                    Budget &{" "}
                    <span className="text-orange-500">
                      expectations.
                    </span>
                  </StepTitle>

                  <StepDescription>
                    Help us understand the financial framework and what matters
                    most to your team.
                  </StepDescription>
                </>
              )}

              {step === 2 && (
                <>
                  <StepTitle>
                    Project{" "}
                    <span className="text-orange-500">
                      details.
                    </span>
                  </StepTitle>

                  <StepDescription>
                    Share the constraints, conditions, and information that can
                    help us prepare.
                  </StepDescription>
                </>
              )}

              {step === 3 && (
                <>
                  <StepTitle>
                    Final{" "}
                    <span className="text-orange-500">
                      confirmation.
                    </span>
                  </StepTitle>

                  <StepDescription>
                    Tell us who to contact and how you&apos;d prefer us to
                    follow up.
                  </StepDescription>
                </>
              )}
            </div>

            {/* STEP 01 */}
            {step === 0 && (
              <div className="pt-8 md:pt-10">
                <div className="grid gap-5 md:grid-cols-2 md:gap-6">
                  <Field label="Project / facility type">
                    <select className={inputClass}>
                      <option>Commercial</option>
                      <option>Institutional</option>
                      <option>Multifamily</option>
                      <option>Industrial</option>
                      <option>Other</option>
                    </select>
                  </Field>

                  <Field label="Nature / scope of work">
                    <input
                      className={inputClass}
                      placeholder="Fit-out, retrofit, service upgrade..."
                    />
                  </Field>

                  <Field label="Project location">
                    <input
                      className={inputClass}
                      placeholder="City, state"
                    />
                  </Field>

                  <Field label="Desired start date">
                    <input
                      type="date"
                      className={inputClass}
                    />
                  </Field>
                </div>

                <Choice
                  label="Desired completion timeline"
                  items={[
                    "1–3 months",
                    "3–6 months",
                    "6–12 months",
                    "Flexible",
                  ]}
                />
              </div>
            )}

            {/* STEP 02 */}
            {step === 1 && (
              <div className="pt-8 md:pt-10">
                <Choice
                  label="Estimated budget range"
                  items={[
                    "Under $50K",
                    "$50K–$150K",
                    "$150K–$300K",
                    "$300K–$1M+",
                    "Not sure yet",
                  ]}
                />

                <div className="mt-9 grid gap-5 md:mt-10 md:grid-cols-2 md:gap-6">
                  <Field label="What matters most?">
                    <select className={inputClass}>
                      <option>Schedule certainty</option>
                      <option>Budget control</option>
                      <option>Minimal disruption</option>
                      <option>Energy performance</option>
                    </select>
                  </Field>

                  <Field label="Special requirements">
                    <input
                      className={inputClass}
                      placeholder="Shutdowns, occupied site, security..."
                    />
                  </Field>
                </div>
              </div>
            )}

            {/* STEP 03 */}
            {step === 2 && (
              <div className="pt-8 md:pt-10">
                <div className="grid gap-5 md:gap-6">
                  <Field label="Project description">
                    <textarea
                      className={`${inputClass} min-h-[160px] resize-y md:min-h-[180px]`}
                      placeholder="Describe the existing condition, desired outcome, constraints, and known equipment or systems."
                    />
                  </Field>

                  <Field label="Project files">
                    <input
                      type="file"
                      multiple
                      className={`
                        ${inputClass}

                        file:mr-3
                        file:border-0
                        file:bg-[rgb(31,32,33)]
                        file:px-3
                        file:py-2
                        file:text-[9px]
                        file:font-medium
                        file:uppercase
                        file:tracking-[0.1em]
                        file:text-white

                        sm:file:mr-4
                        sm:file:px-4
                        sm:file:text-[10px]
                        sm:file:tracking-[0.12em]
                      `}
                    />
                  </Field>
                </div>

                <Choice
                  label="Is the site currently occupied?"
                  items={[
                    "Yes",
                    "No",
                    "Partially",
                  ]}
                />

                <Choice
                  label="Preferred communication method"
                  items={[
                    "Email",
                    "Phone",
                    "Text",
                    "Video call",
                  ]}
                />
              </div>
            )}

            {/* STEP 04 */}
            {step === 3 && (
              <div className="pt-8 md:pt-10">
                <div className="grid gap-5 md:grid-cols-2 md:gap-6">
                  <Field label="Full name">
                    <input
                      className={inputClass}
                      placeholder="First and last name"
                    />
                  </Field>

                  <Field label="Email">
                    <input
                      type="email"
                      className={inputClass}
                      placeholder="you@example.com"
                    />
                  </Field>

                  <Field label="Phone">
                    <input
                      className={inputClass}
                      placeholder="Phone number"
                    />
                  </Field>

                  <Field label="Company">
                    <input
                      className={inputClass}
                      placeholder="Optional"
                    />
                  </Field>

                  <Field label="Best time to contact">
                    <select className={inputClass}>
                      <option>Morning</option>
                      <option>Afternoon</option>
                      <option>Evening</option>
                    </select>
                  </Field>
                </div>

                <div
                  className="
                    mt-8
                    flex
                    gap-3
                    border
                    border-black/10
                    bg-white
                    p-4
                    sm:gap-4
                    sm:p-5
                    md:mt-10
                  "
                >
                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0 text-orange-500"
                  />

                  <p
                    className="
                      max-w-2xl
                      text-[12px]
                      leading-[1.7]
                      text-black/50
                      sm:text-[13px]
                    "
                  >
                    By submitting this request, you&apos;re giving our team
                    permission to follow up about your project and discuss the
                    appropriate next steps.
                  </p>
                </div>
              </div>
            )}

            {/* RESPONSIVE NAVIGATION */}
            <div
              className="
                mt-10
                flex
                flex-col-reverse
                gap-3
                border-t
                border-black/10
                pt-5

                sm:flex-row
                sm:items-center
                sm:justify-between
                sm:gap-4

                md:mt-14
                md:pt-6
              "
            >
              <div className="w-full sm:w-auto">
                <BackButton
                  disabled={step === 0}
                  onClick={() =>
                    setStep((current) =>
                      Math.max(0, current - 1)
                    )
                  }
                />
              </div>

              <div className="w-full sm:w-auto">
                {step < steps.length - 1 ? (
                  <ContinueButton
                    onClick={() =>
                      setStep((current) =>
                        Math.min(
                          steps.length - 1,
                          current + 1,
                        )
                      )
                    }
                  >
                    Save & continue
                  </ContinueButton>
                ) : (
                  <SubmitButton
                    onClick={() => setSubmitted(true)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h2
      className="
        mt-5
        max-w-[760px]
        text-[clamp(2rem,8vw,5rem)]
        font-medium
        leading-[0.98]
        tracking-[-0.05em]
        text-[rgb(31,32,33)]
      "
    >
      {children}
    </h2>
  );
}

function StepDescription({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p
      className="
        mt-5
        max-w-[620px]
        text-[14px]
        leading-[1.7]
        text-black/50
        sm:text-[15px]
        md:mt-6
        md:text-[16px]
        md:leading-[1.75]
      "
    >
      {children}
    </p>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label
      className="
        block
        text-[10px]
        font-medium
        uppercase
        tracking-[0.1em]
        text-black/55
        sm:text-[11px]
      "
    >
      {label}
      {children}
    </label>
  );
}

function Choice({
  label,
  items,
}: {
  label: string;
  items: string[];
}) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="mt-8 md:mt-10">
      <p
        className="
          text-[10px]
          font-medium
          uppercase
          tracking-[0.1em]
          text-black/55
          sm:text-[11px]
        "
      >
        {label}
      </p>

      <div
        className="
          mt-4
          grid
          gap-2
          sm:grid-cols-2
          md:flex
          md:flex-wrap
        "
      >
        {items.map((item) => {
          const active = selected === item;

          return (
            <button
              type="button"
              key={item}
              onClick={() => setSelected(item)}
              className={`
                inline-flex
                min-h-12
                w-full
                items-center
                justify-center
                gap-2
                border
                px-4
                py-3
                text-[13px]
                transition-all
                duration-300

                md:w-auto
                md:justify-start

                ${
                  active
                    ? "border-[rgb(31,32,33)] bg-[rgb(31,32,33)] text-white"
                    : "border-black/15 bg-white/60 text-black/65 hover:border-orange-500 hover:text-black"
                }
              `}
            >
              {active && (
                <Check
                  size={13}
                  className="shrink-0 text-orange-500"
                />
              )}

              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BackButton({
  disabled,
  onClick,
}: {
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="
        group
        inline-flex
        min-h-12
        w-full
        items-center
        justify-center
        gap-2
        border
        border-black/15
        bg-white/40
        px-5
        py-3.5
        text-[10px]
        font-medium
        uppercase
        tracking-[0.13em]
        text-black
        transition-all
        duration-300
        ease-[cubic-bezier(.22,1,.36,1)]

        hover:border-black
        hover:bg-black
        hover:text-white

        disabled:pointer-events-none
        disabled:opacity-25

        sm:w-auto
        sm:justify-start
        sm:border-transparent
        sm:bg-transparent
        sm:px-0
        sm:text-[11px]
        sm:tracking-[0.15em]

        sm:hover:bg-transparent
        sm:hover:text-black
      "
    >
      <ArrowLeft
        size={16}
        className="
          shrink-0
          transition-transform
          duration-300
          group-hover:-translate-x-1
        "
      />

      Back
    </button>
  );
}

function ContinueButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        relative
        inline-flex
        min-h-12
        w-full
        items-center
        justify-center
        gap-3
        overflow-hidden
        bg-[rgb(31,32,33)]
        px-5
        py-3.5
        text-[10px]
        font-medium
        uppercase
        tracking-[0.13em]
        text-white
        shadow-[0_10px_30px_rgba(0,0,0,0.08)]
        transition-all
        duration-300
        ease-[cubic-bezier(.22,1,.36,1)]

        hover:bg-orange-500
        hover:shadow-[0_14px_35px_rgba(249,115,22,0.18)]

        active:scale-[0.98]

        sm:w-auto
        sm:px-6
        sm:text-[11px]
        sm:tracking-[0.15em]
      "
    >
      <span>{children}</span>

      <ArrowRight
        size={15}
        className="
          shrink-0
          transition-transform
          duration-300
          group-hover:translate-x-1
        "
      />
    </button>
  );
}

function SubmitButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        inline-flex
        min-h-12
        w-full
        items-center
        justify-center
        gap-3
        bg-orange-500
        px-5
        py-3.5
        text-[10px]
        font-medium
        uppercase
        tracking-[0.12em]
        text-white
        shadow-[0_12px_35px_rgba(249,115,22,0.18)]
        transition-all
        duration-300
        ease-[cubic-bezier(.22,1,.36,1)]

        hover:bg-[rgb(31,32,33)]
        hover:shadow-[0_14px_40px_rgba(0,0,0,0.14)]

        active:scale-[0.98]

        sm:w-auto
        sm:px-6
        sm:text-[11px]
        sm:tracking-[0.15em]
      "
    >
      <span className="sm:hidden">
        Submit
      </span>

      <span className="hidden sm:inline">
        Submit consultation
      </span>

      <ArrowRight
        size={15}
        className="
          shrink-0
          transition-transform
          duration-300
          group-hover:translate-x-1
        "
      />
    </button>
  );
}