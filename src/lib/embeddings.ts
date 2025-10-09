import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";

export const embeddings = new HuggingFaceTransformersEmbeddings({
    model: "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",

});
