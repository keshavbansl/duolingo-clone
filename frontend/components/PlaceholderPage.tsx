
import Link from "next/link";

type Props = {
  title: string;
  description: string;
  icon?: string;
};

export default function PlaceholderPage({
  title,
  description,
  icon = "🚧",
}: Props) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 text-6xl">{icon}</div>

      <h1 className="text-3xl font-extrabold">{title}</h1>

      <p className="mt-3 max-w-md text-gray-500">{description}</p>

      <span className="mt-5 rounded-full bg-yellow-100 px-4 py-2 text-sm font-bold text-yellow-800">
        Coming soon
      </span>

      <Link
        href="/"
        className="mt-8 rounded-xl border-b-4 border-green-700 bg-green-500 px-6 py-3 font-bold text-white hover:bg-green-600"
      >
        Back to learning
      </Link>
    </main>
  );
}
