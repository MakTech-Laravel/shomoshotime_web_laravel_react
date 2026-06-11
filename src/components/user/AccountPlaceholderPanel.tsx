/** Addresses and wallet tabs — no backend list APIs yet; replace body when endpoints exist. */
type AccountPlaceholderPanelProps = {
  title: string;
  description: string;
};

export function AccountPlaceholderPanel({ title, description }: AccountPlaceholderPanelProps) {
  return (
    <section className="mt-8 sm:mt-9">
      <h2 className="font-montserrat text-[1.75rem] font-bold leading-none tracking-tight text-black sm:text-[2rem]">
        {title}
      </h2>
      <p className="mt-2.5 font-montserrat text-[15px] font-normal leading-normal text-[#757575]">
        {description}
      </p>
      <div className="mt-7 border-t border-[#e0e0e0]">
        <p className="py-10 text-center font-montserrat text-[15px] font-normal text-[#9a9a9a]">
          No items to display yet.
        </p>
      </div>
    </section>
  );
}
