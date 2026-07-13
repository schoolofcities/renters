/**
 * Ordinary least-squares fit for a set of {x, y} points.
 * Used to draw trend lines on scatter plots — the displayed r-value itself is passed in
 * separately (pre-computed by the caller), this just gives the line's slope/intercept.
 */
export function linearRegression(points) {
	const n = points.length;
	let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
	for (const p of points) {
		sumX += p.x;
		sumY += p.y;
		sumXY += p.x * p.y;
		sumXX += p.x * p.x;
	}
	const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
	const intercept = (sumY - slope * sumX) / n;
	return { slope, intercept };
}
