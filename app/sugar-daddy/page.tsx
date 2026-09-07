import { GuidePage } from "../components/seo/GuidePage";
import { getPublicGuide } from "@/lib/public-guides";
import { publicMetadata } from "@/lib/seo";

const guide = getPublicGuide("sugar-daddy");
export const metadata = publicMetadata(guide.title, guide.description, `/${guide.slug}`);
export default function Page() { return <GuidePage guide={guide} />; }
