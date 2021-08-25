import SQSJobStore from "./SQSJobStore"
import {IDMJobMessage, IProfileJobMessage} from "./interfaces"


const getProfileJob = async (jobStore: SQSJobStore, queueUrl: string) => {
  const profileJobRequest = { queueUrl }

  const profileJob = await jobStore.getProfileJob(profileJobRequest)
  console.log(profileJob)

  return await jobStore.removeJob(profileJobRequest, profileJob)
}

const getEmptyJob = async (jobStore: SQSJobStore, queueUrl: string) => {
  try {
    const testJobRequest = { queueUrl }

    const testJob = await jobStore.getProfileJob(testJobRequest)
    console.log(testJob)

    return await jobStore.removeJob(testJobRequest, testJob)
  } catch (err) {
    console.error(`No messages`)
  }
}

const addProfileJob = async (jobStore: SQSJobStore, queueUrl: string, jobMessage: IProfileJobMessage) => {
  return await jobStore.addProfileJob(queueUrl, jobMessage)
}

const addDMJob = async (jobStore: SQSJobStore, queueUrl: string, jobMessage: IDMJobMessage) => {
  return await jobStore.addDMJob(queueUrl, jobMessage)
}


(async () => {
  const jobStore = new SQSJobStore()

  const profileJobsQueueUrl = 'https://sqs.us-east-1.amazonaws.com/196763078229/test_ProfileJobs.fifo'
  const dmJobsQueueUrl = 'https://sqs.us-east-1.amazonaws.com/196763078229/holagos.fifo'
  const emptyJobsQueueUrl = 'https://sqs.us-east-1.amazonaws.com/196763078229/test_Empty.fifo'

  // await getProfileJob(jobStore, profileJobsQueueUrl)
  // await getEmptyJob(jobStore, emptyJobsQueueUrl)

  // await addProfileJob(jobStore, profileJobsQueueUrl, { username: 'lindasbrasileiras20' })

  const targets = [
    {username: 'bete_aers', full_name: 'Bete Rodrigues'},
    {username: '_mariateresa_27', full_name: 'Maria Terêsa'},
    {username: 'gabizinhacavalcanti2017', full_name: 'Gabiii'},
    {username: 'luciana_noro', full_name: 'Dra. Luciana Noro (Med. Vet.)'},
    {username: 'carlinhaeralph', full_name: 'Ralph E. Carla'},
    {username: 'maribassane', full_name: 'Mari Bassane'},
    {username: 'lucasobrabo', full_name: 'Lucas Silvaa'},
    {username: '_jessicaferreiracastro', full_name: 'Jessica Ferreira'},
    {username: 'laline_chris', full_name: 'Laline Christina'},
    {username: 'lucia.farma', full_name: 'Maria Lucia Morais'},
    {username: 'rayssaventury', full_name: 'Rayssa Ventury'},
    {username: 'giselebarros1983', full_name:	'🌻Gisele🌻'},
    {username: 'deisemontserrat', full_name: 'Deise Mont Serrat'},
    {username: 'mirian.santossilva', full_name: 'Mirian Santos Silva'},
    {username: 'andrejosedenoronha', full_name:	'dr° André de Noronha'},
    {username: 'krmemferreira.cf', full_name: 'Carmen Lucia'},
    {username: 'fernandeslimar', full_name:	'🌟Rose Fernandes🌟'},
    {username: 'katiacristina4015', full_name: 'Kátia Cristina'},
    {username: 'shyrleycalixto', full_name:	'Shyrley Calixto'},
    {username: 'barbarachebon', full_name: 'Barbara Chebon'},
    {username: 'thomazestefanny', full_name: 'Estéfanny Thômaz'},
    {username: 'tarcillar', full_name: 'Tarcilla'},
    {username: 'nielma.lopes', full_name: 'Renielma'},
    {username: 'torenbichara', full_name:	'Adriana Bichara Cerimonial'},
    {username: 'nessaarnunes', full_name:	'Vanessa Albuquerque'},
    {username: 'alice_be7', full_name: 'Alice_BE7 #butter🧈💜'},
    {username: 'prisamorimgarcia', full_name:	'Priscilla Garcia'},
    {username: 'eliz_m2angels', full_name: 'Elizângela Quintanilha'},
    {username: 'adrianomarcelino5615', full_name:	'adriano Marcelino'},
    {username: 'monickmoreira_', full_name:	'𝗠𝗼𝗻𝗶𝗰𝗸 𝗠𝗼𝗿𝗲𝗶𝗿𝗮'},
    {username: 'titinafortunato', full_name: 'Cristiana Fortunato'},
    {username: 'tattianamachado', full_name: 'Tatiana Machado'},
    {username: 'edna.ferreira7408', full_name: 'Edna.ferreira'},
    {username: 'ilzacordeiroda', full_name:	'ilza cordeiro da rocha.'},
    {username: 'cardozcaroline', full_name:	'Carol'},
    {username: 'izabel.melchiades', full_name: 'Izabel Melchiades'},
    {username: 'tatianeramos37', full_name:	'Tatiane Ramos'},
    {username: 'juvenaljuniorandrade', full_name:	'Juvenal Junior Andrade'},
    {username: 'rosilainefig', full_name:	'Rosilaine Figueiredo'},
    {username: 'alineluizy', full_name:	'Aline Luizy'},
  ]

  for (let target of targets) {
    await addDMJob(jobStore, dmJobsQueueUrl, { username: target.username, full_name: target.full_name })
  }

  process.exit(0)
})()
