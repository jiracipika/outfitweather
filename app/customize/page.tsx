import CustomizeLogic from "@/components/customize-logic";
import { Info } from "lucide-react";

export default function CustomizePage() {
  return (
    <div className="page-frame preferences-page">
      <header className="collection-heading">
        <div>
          <h1>Your <em>wardrobe.</em></h1>
          <p>Add your own clothing advice for specific weather.</p>
        </div>
      </header>
      <div className="preferences-workspace">
        <CustomizeLogic />
        <aside className="preferences-tip">
          <Info size={22} />
          <h2>How notes work</h2>
          <p>The first matching note appears under “Why this outfit?”</p>
          <p>Choose “Any” for conditions that don’t matter. Temperatures use Celsius, and the maximum is exclusive.</p>
          <p>Notes are stored in this browser. You can back them up from your lookbook.</p>
        </aside>
      </div>
    </div>
  );
}
