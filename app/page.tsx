import { getSpots } from "@/lib/actions/get-spots";

export default async function Home() {
  const result = await getSpots();

  if (!result.success) {
    return (
      <div className="flex h-svh items-center justify-center text-red-500">
        Error: {result.error}
      </div>
    );
  }

  const spots = result.data;

  return (
    <div className="flex h-svh flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Home</h1>
      <p>Found {spots.length} spots</p>
    </div>
  );
}
