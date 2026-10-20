import CustomizeLogic from "@/components/customize-logic";

export default function CustomizePage() {
  return (
    <div className="preferences-page">
      <header className="preferences-heading">
        <span className="eyebrow">THE LITTLE DETAILS THAT MAKE IT YOU</span>
        <h1>
          Your wardrobe, <em>your way.</em>
        </h1>
        <p>
          A favourite coat for rainy days? A sweater below 15°? Leave yourself a
          note and we’ll add it to your weather advice.
        </p>
      </header>
      <div className="preferences-workspace">
        <CustomizeLogic />
        <aside className="preferences-tip">
          <span aria-hidden="true">✳︎</span>
          <h2>A little wardrobe wisdom.</h2>
          <p>
            Notes are checked from top to bottom. The first one that matches
            your forecast becomes your personal weather advice.
          </p>
          <p>
            Leave a condition set to “Any” when it doesn’t matter. Temperatures
            use Celsius, with the maximum excluded.
          </p>
          <small>Your notes and saved looks stay in this browser.</small>
        </aside>
      </div>
    </div>
  );
}
