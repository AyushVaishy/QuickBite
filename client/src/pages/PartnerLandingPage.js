import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import LandingLayout from "../components/landing/LandingLayout";

const PartnerLandingPage = () => {
  return (
    <LandingLayout>
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-32 md:px-8">
        <div className="relative mb-24 overflow-hidden rounded-[3rem] bg-slate-900 p-12 text-center text-white shadow-2xl md:p-24">
          <div className="absolute inset-0 bg-gradient-to-b from-brand/20 to-transparent" />
          <div className="relative z-10 space-y-8">
            <h1 className="text-5xl font-bold md:text-7xl">
              Partner with the
              <br />
              <span className="text-brand">Smartest</span> Platform
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-slate-300">
              Increase your revenue and grow repeat customers with a dashboard built for modern food businesses.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button className="rounded-2xl bg-brand px-10 py-4 font-bold text-white shadow-xl shadow-brand/20 transition-colors hover:bg-brand-dark">
                Apply Now
              </button>
              <button className="rounded-2xl border border-white/20 px-10 py-4 font-bold text-white transition-colors hover:bg-white/10">
                Download Brochure
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 items-center gap-12 py-20 lg:grid-cols-2">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-app-primary">How it works</h2>
            <div className="space-y-8">
              {[
                {
                  step: "1",
                  title: "Register Online",
                  text: "Submit your details and restaurant profile through our quick onboarding form.",
                },
                {
                  step: "2",
                  title: "Onboarding Setup",
                  text: "Our team helps configure menu, prep windows, pricing, and availability.",
                },
                {
                  step: "3",
                  title: "Go Live",
                  text: "Start receiving and managing orders in real time from a single panel.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-app-border bg-app text-lg font-bold text-brand shadow-sm">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="mb-1 text-xl font-bold text-app-primary">{item.title}</h4>
                    <p className="text-app-secondary">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-app-border bg-app-surface p-10 shadow-soft md:p-14">
            <h3 className="mb-8 text-2xl font-bold text-app-primary">Dashboard Benefits</h3>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {[
                { title: "Live Orders", desc: "Track incoming orders and fulfillment from one place." },
                { title: "Menu Editor", desc: "Edit items, pricing, and availability in seconds." },
                { title: "Revenue Analytics", desc: "Monitor daily growth and trend performance." },
                { title: "Customer Ratings", desc: "Review feedback and improve operational quality." },
              ].map((item) => (
                <div key={item.title} className="space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <FaCheckCircle size={18} />
                  </div>
                  <h4 className="font-bold text-app-primary">{item.title}</h4>
                  <p className="text-sm text-app-secondary">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
};

export default PartnerLandingPage;