
"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [sound, setSound] = useState(true);
  const [animations, setAnimations] = useState(true);
  const [reminders, setReminders] = useState(false);

  const settings = [
    {
      title: "Sound effects",
      description: "Play sounds during lessons",
      value: sound,
      change: setSound,
    },
    {
      title: "Animations",
      description: "Show interface animations",
      value: animations,
      change: setAnimations,
    },
    {
      title: "Daily reminders",
      description: "Enable learning reminders",
      value: reminders,
      change: setReminders,
    },
  ];

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10">
      <h1 className="mb-2 text-3xl font-extrabold">Settings</h1>
      <p className="mb-8 text-gray-500">
        Customize your learning experience.
      </p>

      <section className="space-y-4">
        {settings.map((setting) => (
          <div
            key={setting.title}
            className="flex items-center justify-between gap-4 rounded-2xl border-2 border-gray-200 p-5"
          >
            <div>
              <h2 className="font-bold">{setting.title}</h2>
              <p className="mt-1 text-sm text-gray-500">
                {setting.description}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={setting.value}
              onClick={() => setting.change(!setting.value)}
              className={`h-8 w-14 shrink-0 rounded-full p-1 transition-colors ${
                setting.value ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`block h-6 w-6 rounded-full bg-white transition-transform ${
                  setting.value ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        ))}
      </section>

      <section className="mt-8 rounded-2xl border-2 border-gray-200 p-5">
        <h2 className="font-bold">Account</h2>
        <p className="mt-2 text-sm text-gray-500">
          Account management and sign-out will be available in a future update.
        </p>
      </section>

      <p className="mt-8 text-center text-sm text-gray-400">
        Duolingo Clone · Settings
      </p>
    </main>
  );
}
