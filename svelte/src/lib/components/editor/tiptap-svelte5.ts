import type { NodeView, NodeViewRendererProps } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import type { Decoration, DecorationWithType, EditorView } from "@tiptap/pm/view";
import type { ComponentType, SvelteComponent } from "svelte";
import { mount, unmount } from "svelte";

export interface NodeViewWrapperProps {
    as?: string;
    class?: string;
    "data-type"?: string;
    children?: any;
}

/**
 * Creates a Svelte 5 compatible NodeView renderer for Tiptap
 */
export function SvelteNodeViewRenderer(
    component: ComponentType<SvelteComponent>,
    options?: {
        update?: ((props: NodeViewRendererProps) => boolean) | null;
        stopEvent?: ((event: Event) => boolean) | null;
    },
): (props: NodeViewRendererProps) => NodeView {
    return (props: NodeViewRendererProps) => {
        const { editor, node: initialNode, getPos, HTMLAttributes, decorations, extension } = props;

        const dom = document.createElement(extension.config.atom !== false && extension.config.inline ? "span" : "div");

        // Create reactive state object that we can mutate
        const reactiveProps = {
            node: initialNode,
            editor,
            getPos,
            HTMLAttributes,
            selected: false,
            decorations,
            extension,
            updateAttributes: (attributes: Record<string, any>) => {
                const pos = getPos();
                if (typeof pos !== "number") return;
                editor.commands.updateAttributes(reactiveProps.node.type.name, attributes);
            },
            deleteNode: () => {
                const pos = getPos();
                if (typeof pos !== "number") return;
                editor.commands.deleteRange({ from: pos, to: pos + reactiveProps.node.nodeSize });
            },
            // Pass through editor storage which can contain custom data like NDK instance
            ...(editor.storage?.nostrEditor || {}),
        };

        // Mount the Svelte component
        const componentInstance = mount(component, {
            target: dom,
            props: reactiveProps,
        });

        return {
            dom,
            contentDOM: undefined,

            update: (updateNode: ProseMirrorNode, updateDecorations: readonly Decoration[]) => {
                const updateFunc = options?.update;

                if (updateFunc === null) {
                    return false;
                }

                if (updateFunc) {
                    return updateFunc({
                        ...props,
                        node: updateNode,
                        decorations: updateDecorations,
                    });
                }

                if (updateNode.type !== reactiveProps.node.type) {
                    return false;
                }

                reactiveProps.node = updateNode;
                reactiveProps.decorations = updateDecorations;

                return true;
            },

            selectNode: () => {
                reactiveProps.selected = true;
            },

            deselectNode: () => {
                reactiveProps.selected = false;
            },

            destroy: () => {
                unmount(componentInstance);
            },

            stopEvent: options?.stopEvent || null,

            ignoreMutation: (mutation: MutationRecord | { type: "selection"; target: Element }) => {
                if (mutation.type === "selection") {
                    return false;
                }

                return !dom.contains(mutation.target) || dom === mutation.target;
            },
        };
    };
}
