//returns a random item from an array
export default function randomElement(array) {
	return array[Math.floor(Math.random() * array.length)];
}