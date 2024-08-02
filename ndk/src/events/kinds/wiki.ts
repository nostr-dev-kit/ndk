import { NDKKind } from ".";
import { NDKArticle } from "./article";

export class NDKWiki extends NDKArticle {
    static kind = NDKKind.Wiki;
    static kinds = [NDKKind.Wiki];
}
