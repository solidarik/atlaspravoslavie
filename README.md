# Атлас православия

Persons, events, and churches of Orthodoxy

authors: solidarik, codmonkdev
create date: 16th November 2020

##
1. Install Mongodb
2. Clone the project:
```git clone git@github.com:solidarik/atlaspravoslavie.git```
3. Install node libraries:
```cd atlaspravoslavie```
```npm install```
4. Get environment's param file, copy or create .env
5. Fill mongodb database:
```node loadDatabase/load.js```
6. Rebuild the map module:
```npm run pack-map```
7. Rebuild other pages:
```npm run pack```
8. Start the project:
```npm start```


## Useful links
[Increase max_user_watches files for nodemon module in Linux](https://stackoverflow.com/questions/55763428/react-native-error-enospc-system-limit-for-number-of-file-watchers-reached)
```echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p```
