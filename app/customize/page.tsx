import CustomizeLogic from "@/components/customize-logic"

export default function CustomizePage() {
  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-6 w-full">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">Customize Outfit Logic</h1>
      <CustomizeLogic />
    </div>
  )
}
