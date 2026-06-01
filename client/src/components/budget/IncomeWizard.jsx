import { useState } from 'react';

const STEPS = ['Pay Type', 'Schedule', 'Rate', 'Confirm'];

function calcMonthly(payType, schedule, rate, hoursPerWeek) {
  if (!rate || rate <= 0) return 0;
  if (payType === 'hourly') {
    const hrs = schedule === 'fullTime' ? 40 : (hoursPerWeek || 0);
    return (rate * hrs * 52) / 12;
  }
  return rate / 12;
}

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
}

export default function IncomeWizard({ month, year, onComplete, onCancel }) {
  const [step, setStep] = useState(0);
  const [payType, setPayType] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [rate, setRate] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState('');
  const [error, setError] = useState('');

  const monthly = calcMonthly(payType, schedule, Number(rate), Number(hoursPerWeek));
  const weekly = payType === 'hourly'
    ? Number(rate) * (schedule === 'fullTime' ? 40 : Number(hoursPerWeek || 0))
    : Number(rate) / 52;
  const annual = payType === 'hourly' ? weekly * 52 : Number(rate);

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  function nextStep() {
    setError('');
    if (step === 2) {
      if (!rate || Number(rate) <= 0) return setError('Please enter a valid amount.');
      if (payType === 'hourly' && schedule === 'partTime') {
        if (!hoursPerWeek || Number(hoursPerWeek) <= 0 || Number(hoursPerWeek) > 168)
          return setError('Please enter valid hours per week.');
      }
    }
    setStep((s) => s + 1);
  }

  function handleConfirm() {
    onComplete({
      income: {
        payType, schedule, rate: Number(rate),
        hoursPerWeek: (payType === 'hourly' && schedule === 'partTime') ? Number(hoursPerWeek) : (schedule === 'fullTime' ? 40 : Number(hoursPerWeek)),
        monthlyIncome: monthly,
      },
    });
  }

  const cardBase = 'flex-1 border-2 rounded-2xl p-6 cursor-pointer transition-all text-center';
  const cardActive = 'border-emerald-500 bg-emerald-900/20';
  const cardInactive = 'border-gray-600 hover:border-emerald-600 bg-gray-700';

  const btnBack = 'flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 py-2.5 rounded-xl text-sm font-medium';
  const btnNext = 'flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white py-2.5 rounded-xl text-sm font-medium';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg border border-gray-700">
        {/* Header */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex justify-between items-start mb-1">
            <div>
              <p className="text-xs font-medium text-emerald-500 uppercase tracking-wider mb-1">
                Step {step + 1} of {STEPS.length}
              </p>
              <h2 className="text-xl font-bold text-gray-100">{MONTH_NAMES[month - 1]} {year} Budget</h2>
            </div>
            <button onClick={onCancel} className="text-gray-500 hover:text-gray-300 text-2xl leading-none">×</button>
          </div>
          <div className="mt-4 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
        </div>

        <div className="px-8 pb-8">
          {/* Step 0: Pay Type */}
          {step === 0 && (
            <>
              <p className="text-gray-400 text-sm mb-6">How are you paid?</p>
              <div className="flex gap-4 mb-6">
                <button className={`${cardBase} ${payType === 'hourly' ? cardActive : cardInactive}`} onClick={() => setPayType('hourly')}>
                  <div className="text-3xl mb-2">⏱</div>
                  <p className="font-semibold text-gray-100">Hourly</p>
                  <p className="text-xs text-gray-500 mt-1">Paid per hour worked</p>
                </button>
                <button className={`${cardBase} ${payType === 'salary' ? cardActive : cardInactive}`} onClick={() => setPayType('salary')}>
                  <div className="text-3xl mb-2">💼</div>
                  <p className="font-semibold text-gray-100">Salaried</p>
                  <p className="text-xs text-gray-500 mt-1">Fixed annual compensation</p>
                </button>
              </div>
              <div className="flex gap-3">
                <button onClick={onCancel} className={btnBack}>Cancel</button>
                <button onClick={nextStep} disabled={!payType} className={btnNext}>Continue</button>
              </div>
            </>
          )}

          {/* Step 1: Schedule */}
          {step === 1 && (
            <>
              <p className="text-gray-400 text-sm mb-6">What's your work schedule?</p>
              <div className="flex gap-4 mb-6">
                <button className={`${cardBase} ${schedule === 'fullTime' ? cardActive : cardInactive}`} onClick={() => setSchedule('fullTime')}>
                  <div className="text-3xl mb-2">📅</div>
                  <p className="font-semibold text-gray-100">Full-time</p>
                  <p className="text-xs text-gray-500 mt-1">~40 hours per week</p>
                </button>
                <button className={`${cardBase} ${schedule === 'partTime' ? cardActive : cardInactive}`} onClick={() => setSchedule('partTime')}>
                  <div className="text-3xl mb-2">🕐</div>
                  <p className="font-semibold text-gray-100">Part-time</p>
                  <p className="text-xs text-gray-500 mt-1">Variable hours per week</p>
                </button>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className={btnBack}>Back</button>
                <button onClick={nextStep} disabled={!schedule} className={btnNext}>Continue</button>
              </div>
            </>
          )}

          {/* Step 2: Rate */}
          {step === 2 && (
            <>
              <p className="text-gray-400 text-sm mb-6">
                {payType === 'hourly' ? 'What is your hourly rate?' : 'What is your annual salary?'}
              </p>
              {error && <p className="text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-xl px-3 py-2 mb-4">{error}</p>}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    {payType === 'hourly' ? 'Hourly rate ($)' : 'Annual salary ($)'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                    <input type="number" min={0} step={payType === 'hourly' ? 0.01 : 1000} value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      placeholder={payType === 'hourly' ? '0.00' : '50000'}
                      className="w-full bg-gray-700 border border-gray-600 text-gray-100 placeholder:text-gray-500 rounded-xl pl-7 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      autoFocus />
                  </div>
                </div>
                {payType === 'hourly' && schedule === 'partTime' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Hours per week</label>
                    <input type="number" min={1} max={168} value={hoursPerWeek}
                      onChange={(e) => setHoursPerWeek(e.target.value)} placeholder="e.g. 25"
                      className="w-full bg-gray-700 border border-gray-600 text-gray-100 placeholder:text-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                )}
                {Number(rate) > 0 && (
                  <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-4">
                    <p className="text-xs font-medium text-emerald-400 mb-2">Estimated breakdown</p>
                    <div className="space-y-1 text-sm text-gray-300">
                      {payType === 'hourly' && schedule === 'partTime' && Number(hoursPerWeek) > 0 && (
                        <div className="flex justify-between"><span>Per hour</span><span className="font-medium">{fmt(Number(rate))}</span></div>
                      )}
                      <div className="flex justify-between"><span>Weekly</span><span className="font-medium">{fmt(weekly)}</span></div>
                      <div className="flex justify-between"><span className="font-semibold text-emerald-400">Monthly</span><span className="font-bold text-emerald-400">{fmt(monthly)}</span></div>
                      <div className="flex justify-between"><span>Annual</span><span className="font-medium">{fmt(annual)}</span></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className={btnBack}>Back</button>
                <button onClick={nextStep} className={btnNext}>Continue</button>
              </div>
            </>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <>
              <p className="text-gray-400 text-sm mb-6">Here's your income summary. Confirm to set up your budget.</p>
              <div className="bg-gray-700 border border-gray-600 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-900/50 rounded-full flex items-center justify-center text-lg">
                    {payType === 'hourly' ? '⏱' : '💼'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-100">
                      {payType === 'hourly' ? 'Hourly' : 'Salaried'} · {schedule === 'fullTime' ? 'Full-time' : 'Part-time'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {payType === 'hourly'
                        ? `${fmt(Number(rate))}/hr · ${schedule === 'fullTime' ? '40' : hoursPerWeek} hrs/wk`
                        : `${fmt(Number(rate))}/year`}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-0.5">Weekly</p>
                    <p className="font-semibold text-gray-200">{fmt(weekly)}</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-3 ring-2 ring-emerald-700">
                    <p className="text-xs text-emerald-400 mb-0.5 font-medium">Monthly</p>
                    <p className="font-bold text-emerald-300 text-lg">{fmt(monthly)}</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-3 col-span-2">
                    <p className="text-xs text-gray-500 mb-0.5">Annual</p>
                    <p className="font-semibold text-gray-200">{fmt(annual)}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className={btnBack}>Back</button>
                <button onClick={handleConfirm} className={btnNext}>Set Up Budget</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
