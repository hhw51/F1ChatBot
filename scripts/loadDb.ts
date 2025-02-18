/* eslint-disable @typescript-eslint/no-unused-vars */
import {DataAPIClient} from "@datastax/astra-db-ts"
import {PuppeteerWebBaseLoader} from "langchain/document_loaders/web/puppeteer"
import OpenAI from "openai"

console.log(process.env.ASTRA_DB_NAMESPACE)
const {
    ASTRA_DB_NAMESPACE ,
ASTRA_DB_COLLECTION ,
ASTRA_DB_API_ENDPOINT  ,
ASTRA_DB_APPLICATION_TOKEN ,
OPENAI_API_KEY 
} = process.env

const openai=new OpenAI({apiKey: OPENAI_API_KEY})