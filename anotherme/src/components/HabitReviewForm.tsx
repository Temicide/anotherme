"use client";

import React, { useState } from "react";
import { Habits } from "@/lib/types";

interface HabitReviewFormProps {
  habits: Habits;
  assumptions: string[];
  onSubmit: (editedHabits: Habits) => void;
}

const HABIT_LABELS: Record<keyof Habits, string> = {
  sleep_hours: "Sleep (hours/night)",
  exercise_freq: "Exercise (days/week)",
  diet_quality: "Diet Quality",
  stress_level: "Stress Level",
  screen_time_hours: "Screen Time (hours/day)",
  caffeine_intake: "Caffeine Intake",
  social_activity: "Social Activity",
  water_intake: "Water Intake",
};

const DIET_OPTIONS: Habits["diet_quality"][] = [
  "poor",
  "fair",
  "good",
  "excellent",
];
const STRESS_OPTIONS: Habits["stress_level"][] = ["low", "moderate", "high"];
const CAFFEINE_OPTIONS: Habits["caffeine_intake"][] = [
  "none",
  "low",
  "moderate",
  "high",
];
const SOCIAL_OPTIONS: Habits["social_activity"][] = [
  "very_low",
  "low",
  "moderate",
  "high",
];
const WATER_OPTIONS: Habits["water_intake"][] = [
  "very_low",
  "low",
  "adequate",
  "high",
];

export default function HabitReviewForm({
  habits,
  assumptions,
  onSubmit,
}: HabitReviewFormProps) {
  const [form, setForm] = useState<Habits>(habits);

  const update = <K extends keyof Habits>(key: K, value: Habits[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isAssumption = (key: string) => assumptions.includes(key);

  const sliderField = (
    key: "sleep_hours" | "exercise_freq" | "screen_time_hours",
    min: number,
    max: number
  ) => (
    <div
      key={key}
      className={[
        "rounded border p-3 transition-colors",
        isAssumption(key)
          ? "border-amber-500/40 bg-amber-500/5"
          : "border-[#1a1a1a] bg-[#111111]",
      ].join(" ")}
    >
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium text-[#e5e5e5]">
          {HABIT_LABELS[key]}
        </label>
        {isAssumption(key) && (
          <span className="text-[10px] font-medium uppercase tracking-wider text-amber-400">
            Assumed
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={form[key]}
          onChange={(e) =>
            update(key, Number(e.target.value) as Habits[typeof key])
          }
          className="flex-1 accent-[#e5e5e5]"
        />
        <span className="min-w-[2rem] text-right text-sm text-[#e5e5e5]">
          {form[key]}
        </span>
      </div>
    </div>
  );

  const selectField = (
    key:
      | "diet_quality"
      | "stress_level"
      | "caffeine_intake"
      | "social_activity"
      | "water_intake",
    options: string[]
  ) => (
    <div
      key={key}
      className={[
        "rounded border p-3 transition-colors",
        isAssumption(key)
          ? "border-amber-500/40 bg-amber-500/5"
          : "border-[#1a1a1a] bg-[#111111]",
      ].join(" ")}
    >
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium text-[#e5e5e5]">
          {HABIT_LABELS[key]}
        </label>
        {isAssumption(key) && (
          <span className="text-[10px] font-medium uppercase tracking-wider text-amber-400">
            Assumed
          </span>
        )}
      </div>
      <select
        value={form[key]}
        onChange={(e) => update(key, e.target.value as Habits[typeof key])}
        className="w-full rounded border border-[#1a1a1a] bg-[#0a0a0a] px-2 py-1.5 text-sm text-[#e5e5e5] outline-none focus:border-[#737373]"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt.replace(/_/g, " ")}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      {sliderField("sleep_hours", 0, 12)}
      {sliderField("exercise_freq", 0, 7)}
      {sliderField("screen_time_hours", 0, 16)}
      {selectField("diet_quality", DIET_OPTIONS)}
      {selectField("stress_level", STRESS_OPTIONS)}
      {selectField("caffeine_intake", CAFFEINE_OPTIONS)}
      {selectField("social_activity", SOCIAL_OPTIONS)}
      {selectField("water_intake", WATER_OPTIONS)}

      <button
        type="submit"
        className="mt-2 w-full rounded bg-[#e5e5e5] py-2.5 text-sm font-semibold text-[#0a0a0a] transition-colors hover:bg-white"
      >
        Simulate
      </button>
    </form>
  );
}
