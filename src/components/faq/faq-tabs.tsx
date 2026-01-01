'use client';

import {useState, type ReactNode} from 'react';

type FaqItem = {
  question: string;
  answer: ReactNode;
};

type WalletSection = {
  title: string;
  items: FaqItem[];
};

type CategoryLabels = {
  protocol: string;
  wallet: string;
};

type Props = {
  categoryLabels: CategoryLabels;
  protocolItems: FaqItem[];
  walletSections: WalletSection[];
};

function FaqCard({question, answer}: FaqItem) {
  return (
    <div className="p-6 md:p-7 bg-white/[0.02] border border-gold-400/10 rounded-xl hover:border-gold-400/30 transition-colors">
      <h3 className="text-xl font-medium text-dark-100 mb-3">{question}</h3>
      <div className="text-[15px] text-dark-300 leading-[1.7] space-y-3">{answer}</div>
    </div>
  );
}

export function FAQTabs({categoryLabels, protocolItems, walletSections}: Props) {
  const [activeTab, setActiveTab] = useState<'protocol' | 'wallet'>('protocol');

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setActiveTab('protocol')}
          className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
            activeTab === 'protocol'
              ? 'bg-gold-400 text-dark-950 shadow-lg shadow-gold-400/20'
              : 'bg-white/[0.03] text-dark-300 hover:bg-white/[0.06] hover:text-dark-100 border border-gold-400/10'
          }`}
        >
          {categoryLabels.protocol}
        </button>
        <button
          onClick={() => setActiveTab('wallet')}
          className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
            activeTab === 'wallet'
              ? 'bg-gold-400 text-dark-950 shadow-lg shadow-gold-400/20'
              : 'bg-white/[0.03] text-dark-300 hover:bg-white/[0.06] hover:text-dark-100 border border-gold-400/10'
          }`}
        >
          {categoryLabels.wallet}
        </button>
      </div>

      {/* Tab content */}
      <div className="space-y-4">
        {activeTab === 'protocol' && (
          <>
            {protocolItems.map((item) => (
              <FaqCard key={item.question} question={item.question} answer={item.answer} />
            ))}
          </>
        )}

        {activeTab === 'wallet' && (
          <>
            {walletSections.map((section) => (
              <div key={section.title} className="mb-8 last:mb-0">
                <h2 className="text-lg font-semibold text-gold-400 mb-4 pl-1">{section.title}</h2>
                <div className="space-y-4">
                  {section.items.map((item) => (
                    <FaqCard key={item.question} question={item.question} answer={item.answer} />
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

