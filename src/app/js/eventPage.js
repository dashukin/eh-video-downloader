// Background script

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

	switch (request.topic) {

		case 'download':
			downloadVideo({
				url: request.url,
				filename: request.filename
			});
			break;

	}

});

function downloadVideo ({url, filename}) {
	chrome.downloads.download({
		url,
		filename,
		saveAs: true
	});
}