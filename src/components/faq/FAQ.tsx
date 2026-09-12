"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

const questions = [
  "How early should I order?",
  "Do you deliver?",
  "Can I customise a cake?",
  "What payment methods are accepted?",
  "How should cakes be stored?",
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-20 md:py-28">
      <div className="container-glaze">
        <div className="grid gap-12 md:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="glaze-eyebrow mb-4 text-[var(--caramel)]">
              Need to know
            </p>

            <h2 className="glaze-section-title">
              Frequently
              <br />
              asked{" "}
              <span className="font-script text-[var(--caramel)]">
                things.
              </span>
            </h2>
          </div>

          <div className="border-t border-[var(--cocoa)]/15">
            {questions.map((question, index) => (
              <div
                key={question}
                className="border-b border-[var(--cocoa)]/15"
              >
                <button
                  onClick={() =>
                    setOpen(open === index ? null : index)
                  }
                  className="flex w-full items-center justify-between py-6 text-left"
                >
                  <span className="font-display text-xl md:text-2xl">
                    {question}
                  </span>

                  <Plus
                    size={18}
                    className={`transition-transform ${
                      open === index ? "rotate-45" : ""
                    }`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-300 ${
                    open === index
                      ? "grid-rows-[1fr] pb-6"
                      : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden text-sm leading-7 text-[var(--cocoa)]/60">
                    We are happy to help. Full information about ordering,
                    delivery and custom cakes will be available here.
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}