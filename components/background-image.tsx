export function BackgroundImage() {
  return (
    <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden">
      <img
        src="/placeholder.svg?key=irnlx"
        alt="Studio Ghibli style lighthouse and beach landscape"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-darkblue/10 backdrop-blur-[2px]"></div>
    </div>
  )
}
