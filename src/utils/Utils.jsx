// Utility functions
const getDayName = (dayKey) => {
    const names = {
        lunedi: 'Lunedì',
        martedi: 'Martedì',
        mercoledi: 'Mercoledì',
        giovedi: 'Giovedì',
        venerdi: 'Venerdì',
        sabato: 'Sabato',
        domenica: 'Domenica'
    };
    return names[dayKey] || dayKey;
};

const getMealName = (mealKey) => {
    const names = {
        colazione: 'Colazione',
        spuntino_meta_mattina: 'Spuntino',
        pranzo: 'Pranzo',
        merenda: 'Merenda',
        cena: 'Cena',
        nell_arco_della_giornata: "Nell'arco della giornata"
    };
    return names[mealKey] || mealKey;
};

const isPreparedDish = (food) => {
    return food.composizione && food.composizione.length > 0;
};

// Day tracking functions
const getDayOfWeek = () => {
    const days = ['domenica', 'lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato'];
    return days[new Date().getDay()];
};

const getWeeksSinceStart = (startDate) => {
    if (!startDate) return 1;
    const now = new Date();
    const start = new Date(startDate);
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeksPassed = Math.floor(diffDays / 7);
    return (weeksPassed % 3) + 1;
};

const getCurrentMealTime = () => {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 10) return 'colazione';
    if (hour >= 10 && hour < 12) return 'spuntino_meta_mattina';
    if (hour >= 12 && hour < 15) return 'pranzo';
    if (hour >= 15 && hour < 18) return 'merenda';
    if (hour >= 18 && hour < 23) return 'cena';
    {/*return 'nell_arco_della_giornata';*/}
};

const getMealOrder = () => {
    return ['colazione', 'spuntino_meta_mattina', 'pranzo', 'merenda', 'cena', 'nell_arco_della_giornata'];
};

const isPastMeal = (mealKey) => {
    const mealOrder = getMealOrder();
    const currentMeal = getCurrentMealTime();
    const currentIndex = mealOrder.indexOf(currentMeal);
    const mealIndex = mealOrder.indexOf(mealKey);
    return mealIndex < currentIndex;
};
export { getDayName, getMealName, isPreparedDish, getDayOfWeek, getWeeksSinceStart, getCurrentMealTime, isPastMeal };