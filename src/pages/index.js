import dynamic from "next/dynamic";

const NoSSR = dynamic(() => import("../components/home"), { ssr: false });

export default function Page() {
  return (
    <div>
      <NoSSR />
    </div>
  );
}
