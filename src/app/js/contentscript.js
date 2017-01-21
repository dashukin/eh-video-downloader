// Content script

/*
	global fetch, document
 */

/**
 * @name chrome
 * @type {Object}
 * @property runtime.sendMessage
 */

let downloadButton = document.createElement('a');
downloadButton.appendChild(document.createTextNode('Download'));
downloadButton.className = 'eh-download-button';

document.body.appendChild(downloadButton);


downloadButton.addEventListener('click', e => {
	e.preventDefault();
	getMediaSources();
}, false);

function getHashId () {
	let hashId;
	Array.prototype.some.call(document.scripts, script => {
		let src = script.src;
		let pattern = /wistia.*\/medias\/(.*)\/metadata\.js/;
		if (pattern.test(src)) {
			[,hashId] = src.match(pattern);
			return true;
		}
	});
	return hashId;
}

function getMediaSources () {
	let hashId = getHashId();
	if (!hashId) {
		return console.error('No hash id');
	}
	let metadataUrl = `https://fast.wistia.com/embed/medias/${hashId}/metadata.js`;

	fetch(metadataUrl)
		.then(response => {
			response.text()
				.then(text => {
					let pattern = /mediaJson\s*=\s* (\{.*\});?/;
					let data = JSON.parse(text.match(pattern)[1]);
					let url = data.assets[4].url;
					let courseName = document.querySelector('.series-title').textContent;
					let currentCourseBlock = document.querySelector('.up-next-list-item.current');
					let seriesName = currentCourseBlock.querySelector('.list-item-title').textContent;
					let seriesList = document.querySelectorAll('.playlist-lessons-list > div');
					let seriesNumber;
					Array.prototype.some.call(seriesList, (item, index) => {
						if (item.contains(currentCourseBlock)) {
							seriesNumber = index + 1;
							return true;
						}
					});
					seriesNumber = seriesNumber ? `${seriesNumber}. ` : '';
					let filename = `${courseName}/${seriesNumber}${seriesName}.mp4`;
					chrome.runtime.sendMessage({
						topic: 'download',
						url,
						filename
					});
				});
		})

}
