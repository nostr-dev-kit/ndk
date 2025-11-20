import type { NDKSvelte } from '@nostr-dev-kit/svelte';
import { createBlossomUpload } from '@nostr-dev-kit/svelte';
import { NDKBlossom } from '@nostr-dev-kit/blossom';

export interface MediaUploadResult {
	url: string;
	sha256: string;
	blurhash?: string;
	mimeType: string;
	dimensions?: { width: number; height: number };
	file: File;
}

export interface MediaUploadOptions {
	fallbackServer?: string;
	accept?: string;
	maxFiles?: number;
}

export function createMediaUpload(ndk: NDKSvelte, options: MediaUploadOptions = {}) {
	const {
		fallbackServer = 'https://blossom.primal.net',
		accept,
		maxFiles
	} = options;

	const blossom = new NDKBlossom(ndk);
	const upload = createBlossomUpload(blossom);

	const state = $state({
		uploads: [] as MediaUploadResult[],
		uploadingFiles: new Map<File, number>(),
		uploadErrors: new Map<File, Error>()
	});

	const isUploading = $derived(state.uploadingFiles.size > 0);
	const progress = $derived(state.uploadingFiles);
	const errors = $derived(state.uploadErrors);

	async function uploadFile(file: File): Promise<void> {
		// Validate file type if accept filter is provided
		if (accept && !isFileAccepted(file, accept)) {
			const error = new Error(`File type ${file.type} not accepted`);
			state.uploadErrors.set(file, error);
			console.error('File type not accepted:', file.type);
			throw error;
		}

		// Check max files limit
		if (maxFiles && state.uploads.length >= maxFiles) {
			const error = new Error(`Maximum ${maxFiles} files allowed`);
			state.uploadErrors.set(file, error);
			console.error('Max files reached:', maxFiles);
			throw error;
		}

		state.uploadingFiles.set(file, 0);
		state.uploadErrors.delete(file);

		try {
			await upload.upload(file, { fallbackServer });

			if (upload.result?.url) {
				// Get image dimensions if it's an image
				let dimensions: { width: number; height: number } | undefined;
				if (file.type.startsWith('image/')) {
					dimensions = await getImageDimensions(file);
				}

				// Handle url being string or string[] - take first if array
				const uploadUrl = upload.result.url;
				const url: string = (Array.isArray(uploadUrl) ? uploadUrl[0]! : uploadUrl) as string;

				const result: MediaUploadResult = {
					url: url as string,
					sha256: (Array.isArray(upload.result.sha256) ? upload.result.sha256[0]! : upload.result.sha256) as string || '',
					blurhash: upload.result.blurhash,
					mimeType: file.type,
					dimensions,
					file
				};

				state.uploads.push(result);
				state.uploadingFiles.delete(file);
			} else {
				console.error('No URL in upload result');
			}
		} catch (error) {
			console.error('Upload error:', error);
			const err = error instanceof Error ? error : new Error('Upload failed');
			state.uploadErrors.set(file, err);
			state.uploadingFiles.delete(file);
			throw err;
		}
	}

	async function uploadFiles(files: FileList | File[]): Promise<void> {
		const fileArray = Array.from(files);
		await Promise.allSettled(fileArray.map(file => uploadFile(file)));
	}

	function removeUpload(index: number): void {
		state.uploads.splice(index, 1);
	}

	function reorderUpload(fromIndex: number, toIndex: number): void {
		if (fromIndex === toIndex) return;
		if (fromIndex < 0 || fromIndex >= state.uploads.length) return;
		if (toIndex < 0 || toIndex >= state.uploads.length) return;

		const [removed] = state.uploads.splice(fromIndex, 1);
		state.uploads.splice(toIndex, 0, removed);
	}

	function clearUploads(): void {
		state.uploads = [];
		state.uploadingFiles.clear();
		state.uploadErrors.clear();
	}

	return {
		get uploads() {
			return state.uploads;
		},
		set uploads(value: MediaUploadResult[]) {
			state.uploads = value;
		},
		uploadFile,
		uploadFiles,
		removeUpload,
		reorderUpload,
		clearUploads,
		get isUploading() {
			return isUploading;
		},
		get progress() {
			return progress;
		},
		get errors() {
			return errors;
		}
	};
}

function isFileAccepted(file: File, accept: string): boolean {
	const acceptTypes = accept.split(',').map(t => t.trim());

	for (const type of acceptTypes) {
		// Exact match
		if (type === file.type) return true;

		// Wildcard match (e.g., "image/*")
		if (type.endsWith('/*')) {
			const prefix = type.slice(0, -2);
			if (file.type.startsWith(prefix + '/')) return true;
		}

		// Extension match (e.g., ".jpg")
		if (type.startsWith('.')) {
			if (file.name.toLowerCase().endsWith(type.toLowerCase())) return true;
		}
	}

	return false;
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const url = URL.createObjectURL(file);

		img.onload = () => {
			URL.revokeObjectURL(url);
			resolve({ width: img.width, height: img.height });
		};

		img.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error('Failed to load image'));
		};

		img.src = url;
	});
}
