pipeline{
    agent { label 'rootless-docker'}
    
    stages{
        stage('Get AgriPulse from GitHub'){
            steps {
                checkout scm
            }
        }
        
        stage('Build and deploy AgriPulse') {
            steps {
                sh '''
                 docker compose --env-file /home/user/Downloads/AgriPulse-updated/.env -p agripulse-main up --build --wait
                  curl --fail --silent --show-error --max-time 10 http://127.0.0.1:5174/login -o /dev/null
        '''
    }
}
    }
}
