import { Card } from "@/components/ui/card"

export function WeatherSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full max-w-4xl animate-pulse">
      <Card className="md:col-span-1 lg:col-span-1">
        <div className="p-6">
          <div className="h-8 w-3/4 bg-muted rounded-md mb-4"></div>
          <div className="h-4 w-1/2 bg-muted rounded-md mb-8"></div>
          <div className="flex flex-col items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-muted"></div>
            <div className="h-10 w-1/4 bg-muted rounded-md"></div>
            <div className="h-6 w-1/2 bg-muted rounded-md"></div>
            <div className="grid grid-cols-2 gap-2 w-full">
              <div className="h-4 w-full bg-muted rounded-md"></div>
              <div className="h-4 w-full bg-muted rounded-md"></div>
              <div className="h-4 w-full bg-muted rounded-md"></div>
              <div className="h-4 w-full bg-muted rounded-md"></div>
            </div>
          </div>
        </div>
      </Card>

      <div className="md:col-span-1 lg:col-span-2 flex flex-col items-center justify-center">
        <div className="h-8 w-3/4 bg-muted rounded-md mb-4"></div>
        <Card className="w-full max-w-sm">
          <div className="p-6">
            <div className="h-6 w-3/4 bg-muted rounded-md mb-2"></div>
            <div className="h-4 w-1/2 bg-muted rounded-md mb-4"></div>
            <div className="h-20 w-full bg-muted rounded-md mb-4"></div>
            <div className="flex justify-end">
              <div className="h-8 w-24 bg-muted rounded-md"></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export function FavoritesSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl animate-pulse">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="w-full">
          <div className="p-6">
            <div className="h-6 w-3/4 bg-muted rounded-md mb-2"></div>
            <div className="h-4 w-1/2 bg-muted rounded-md mb-4"></div>
            <div className="h-16 w-full bg-muted rounded-md mb-4"></div>
            <div className="flex justify-end">
              <div className="h-8 w-24 bg-muted rounded-md"></div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
