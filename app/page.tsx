import { getSpots } from "@/actions/get-spots";

export default async function Home() {
  const spots = await getSpots();

  return <div className="flex h-svh items-center justify-center"></div>;
}
