export function cut(str: string, limit: number) {
	if (str.length < limit) {
		return str
	}
	const extension = str.match(/\.\w+$/i)!

	return str.slice(0, limit) + '..' + extension[0]
}
