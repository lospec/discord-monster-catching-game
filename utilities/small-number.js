export default function smallNumber(number, digits = 2) {
	const tiny = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];

	number = String(number)
		.split('')
		.map(n => tiny[n])
		.join('');

	if (number.length == 1) number = '⁰' + number;
	if (digits == 3 && number.length == 2) number = '⁰' + number;

	return number;
}