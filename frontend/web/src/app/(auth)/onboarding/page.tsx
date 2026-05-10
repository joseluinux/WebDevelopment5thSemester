export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex w-full overflow-hidden">
      {/* Left Panel — Editorial Visual Anchor */}
      <div className="hidden md:flex md:w-1/2 relative items-center justify-center p-12 bg-surface-container-lowest overflow-hidden">
        {/* Gradient Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-primary-container/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-100 h-100 bg-tertiary-container/5 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-lg">
          <h1 className="font-headline text-6xl font-black tracking-tighter text-white mb-6 leading-none uppercase">
            LUMEMEI
          </h1>
          <p className="text-on-surface-variant text-xl leading-relaxed mb-8 font-light">
            Precision intelligence for the modern entrepreneur. Manage your
            fiscal identity with obsidian clarity and geometric technicality.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-surface-container rounded-xl border border-white/5">
              <span
                className="material-symbols-outlined text-primary mb-3 block"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                analytics
              </span>
              <h3 className="font-headline font-bold text-white mb-1">
                CNAE Intelligence
              </h3>
              <p className="text-sm text-on-surface-variant">
                Automated classification and regulatory mapping.
              </p>
            </div>
            <div className="p-6 bg-surface-container rounded-xl border border-white/5">
              <span
                className="material-symbols-outlined text-primary mb-3 block"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                shield_with_heart
              </span>
              <h3 className="font-headline font-bold text-white mb-1">
                Fiscal Security
              </h3>
              <p className="text-sm text-on-surface-variant">
                Encrypted vault for high-value financial data.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form Canvas */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-surface-container-low relative">
        {/* Mobile Brand */}
        <div className="md:hidden absolute top-8 left-8">
          <span className="font-headline text-xl font-black tracking-tighter text-white">
            LUMEMEI
          </span>
        </div>

        <div className="w-full max-w-110 space-y-8">
          {/* Step Indicator */}
          <div className="space-y-4">
            <div className="flex justify-between items-end mb-2">
              <span className="font-label text-xs uppercase tracking-widest text-primary font-bold">
                Step 02 of 04
              </span>
              <span className="font-headline text-2xl font-bold text-white">
                Business DNA
              </span>
            </div>
            <div className="h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full prism-gradient w-2/4 transition-all duration-500" />
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-surface-container p-8 rounded-2xl border border-white/3 shadow-2xl">
            <form action="/dashboard" method="GET" className="space-y-6">
              {/* CNAE */}
              <div className="space-y-2">
                <label className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant block">
                  Primary CNAE Activity
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-sm">
                    search
                  </span>
                  <input
                    type="text"
                    name="cnae"
                    placeholder="e.g. 6201-5/00 Development of software"
                    className="w-full bg-surface-container-lowest border-none rounded-lg py-4 pl-12 pr-4 text-sm text-on-surface focus:ring-1 focus:ring-primary/30 transition-all font-body"
                  />
                </div>
              </div>

              {/* Revenue Range */}
              <div className="space-y-2">
                <label className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant block">
                  Annual Projected Revenue
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col items-start p-4 bg-surface-container-lowest rounded-lg border border-transparent text-left">
                    <span className="text-xs font-headline font-bold text-on-surface mb-1">
                      Up to R$ 40k
                    </span>
                    <span className="text-[10px] text-on-surface-variant">
                      Micro Scale
                    </span>
                  </div>
                  <div className="flex flex-col items-start p-4 bg-surface-container-lowest rounded-lg border border-primary/60 bg-primary/5 text-left">
                    <span className="text-xs font-headline font-bold text-white mb-1">
                      R$ 40k – R$ 81k
                    </span>
                    <span className="text-[10px] text-primary">
                      Standard MEI
                    </span>
                  </div>
                </div>
              </div>

              {/* Employee Count */}
              <div className="space-y-2">
                <label className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant block">
                  Employee Count
                </label>
                <div className="flex items-center space-x-4 p-4 bg-surface-container-lowest rounded-lg">
                  <span className="material-symbols-outlined text-on-surface-variant">
                    person_add
                  </span>
                  <input
                    type="range"
                    name="employees"
                    min="0"
                    max="1"
                    step="1"
                    defaultValue="1"
                    className="flex-1 accent-primary"
                  />
                  <span className="font-headline font-bold text-white text-sm">
                    01
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex flex-col gap-4">
                <button
                  type="submit"
                  className="w-full py-4 prism-gradient text-[#002979] font-headline font-bold rounded-lg hover:shadow-[0_0_20px_rgba(106,140,242,0.3)] transition-all flex items-center justify-center gap-2"
                >
                  Continue Analysis
                  <span className="material-symbols-outlined text-lg">
                    arrow_forward
                  </span>
                </button>
                <button
                  type="button"
                  className="w-full py-4 text-on-surface-variant font-label text-xs uppercase tracking-widest hover:text-white transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </form>
          </div>

          {/* Legal */}
          <p className="text-center text-on-surface-variant/40 text-[10px] uppercase tracking-widest">
            By continuing, you agree to the LUMEMEI{" "}
            <span className="text-on-surface-variant/60 cursor-pointer hover:text-primary transition-colors">
              Terms of Protocol
            </span>{" "}
            and{" "}
            <span className="text-on-surface-variant/60 cursor-pointer hover:text-primary transition-colors">
              Privacy Architecture
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
