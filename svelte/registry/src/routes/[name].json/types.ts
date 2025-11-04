export interface RegistryFile {
	path: string;
	type: string;
}

export interface RegistryItem {
	name: string;
	type: string;
	title: string;
	description: string;
	registryDependencies: string[];
	dependencies: string[];
	files: RegistryFile[];
	version: string;
	updatedAt: string;
}

export interface RegistryData {
	$schema: string;
	name: string;
	homepage: string;
	aliases: Record<string, string>;
	items: RegistryItem[];
}

export interface TransformedFile {
	content: string;
	type: string;
	target: string;
}

export interface TransformedItem extends Omit<RegistryItem, 'files'> {
	files: TransformedFile[];
}
