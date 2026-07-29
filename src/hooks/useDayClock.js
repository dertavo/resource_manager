import { useCallback, useEffect } from 'react';
import usePersistentState, { numberStorage } from './usePersistentState';

const createDailyBalance = () => ({
  date: new Date().toISOString().split('T')[0],
  income: 0,
  expenses: 0,
  entries: [],
});

const useDayClock = (setMessage) => {
  const [dailyBalance, setDailyBalance] = usePersistentState(
    'dailyBalance',
    createDailyBalance,
  );
  const [globalBalance, setGlobalBalance] = usePersistentState('globalBalance', {
    income: 0,
    expenses: 0,
    entries: [],
  });
  const [dayConfig, setDayConfig] = usePersistentState('dayConfig', {
    startHour: 6,
    endHour: 4,
    canSleepFromHour: 22,
    speedMultiplier: 60,
  });
  const [currentDayTime, setCurrentDayTime] = usePersistentState(
    'currentDayTime',
    dayConfig.startHour,
    numberStorage,
  );
  const [isClockRunning, setIsClockRunning] = usePersistentState(
    'isClockRunning',
    false,
  );
  const [currentDay, setCurrentDay] = usePersistentState(
    'currentDay',
    1,
    numberStorage,
  );

  const finishDay = useCallback(() => {
    const netBalance = dailyBalance.income - dailyBalance.expenses;

    setGlobalBalance(previous => ({
      income: previous.income + dailyBalance.income,
      expenses: previous.expenses + dailyBalance.expenses,
      entries: [
        ...previous.entries,
        {
          id: `day-${currentDay}-transfer-${Date.now()}`,
          type: netBalance >= 0 ? 'income' : 'expense',
          amount: Math.abs(netBalance),
          description: `Balance del Día ${currentDay}`,
          timestamp: new Date().toISOString(),
        },
      ],
    }));
    setDailyBalance(createDailyBalance());
    setCurrentDay(previous => previous + 1);
    setCurrentDayTime(dayConfig.startHour);
    setIsClockRunning(false);
    setMessage(
      `Día ${currentDay} finalizado. Balance transferido al global: $${netBalance.toFixed(2)}`,
    );
  }, [
    currentDay,
    dailyBalance,
    dayConfig.startHour,
    setCurrentDay,
    setCurrentDayTime,
    setDailyBalance,
    setGlobalBalance,
    setIsClockRunning,
    setMessage,
  ]);

  useEffect(() => {
    if (!isClockRunning) return undefined;

    const interval = setInterval(() => {
      setCurrentDayTime(previous => {
        const increment = (1 / 60) * (dayConfig.speedMultiplier / 60);
        let nextTime = previous + increment;

        if (nextTime >= 24) nextTime -= 24;

        const { startHour, endHour } = dayConfig;
        const reachedEndHour = endHour < startHour
          ? (previous < endHour && nextTime >= endHour)
            || (previous >= startHour && nextTime >= 24)
          : previous < endHour && nextTime >= endHour;

        if (reachedEndHour) {
          setTimeout(finishDay, 100);
        }

        return nextTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [dayConfig, finishDay, isClockRunning, setCurrentDayTime]);

  const canSleep = useCallback(() => {
    const { canSleepFromHour, startHour, endHour } = dayConfig;
    return endHour < startHour
      ? currentDayTime >= canSleepFromHour || currentDayTime <= endHour
      : currentDayTime >= canSleepFromHour && currentDayTime <= endHour;
  }, [currentDayTime, dayConfig]);

  return {
    dailyBalance,
    setDailyBalance,
    globalBalance,
    setGlobalBalance,
    dayConfig,
    setDayConfig,
    currentDayTime,
    isClockRunning,
    setIsClockRunning,
    currentDay,
    finishDay,
    canSleep,
  };
};

export default useDayClock;
