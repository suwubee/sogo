!function(){"use strict";function configure($stateProvider,$urlRouterProvider){$stateProvider.state("preferences",{"abstract":!0,views:{preferences:{templateUrl:"preferences.html",controller:"PreferencesController",controllerAs:"app"}},resolve:{statePreferences:statePreferences}}).state("preferences.general",{url:"/general",views:{module:{templateUrl:"generalPreferences.html"}}}).state("preferences.calendars",{url:"/calendars",views:{module:{templateUrl:"calendarsPreferences.html"}}}).state("preferences.addressbooks",{url:"/addressbooks",views:{module:{templateUrl:"addressbooksPreferences.html"}}}).state("preferences.mailer",{url:"/mailer",views:{module:{templateUrl:"mailerPreferences.html"}}}),$urlRouterProvider.otherwise("/general")}function statePreferences(Preferences){return Preferences}function runBlock($rootScope){$rootScope.$on("$routeChangeError",function(event,current,previous,rejection){console.error(event,current,previous,rejection)})}angular.module("SOGo.PreferencesUI",["ngSanitize","ui.router","ck","SOGo.Common","SOGo.MailerUI","SOGo.ContactsUI","SOGo.Authentication"]).config(configure).run(runBlock),configure.$inject=["$stateProvider","$urlRouterProvider"],statePreferences.$inject=["Preferences"],runBlock.$inject=["$rootScope"]}(),function(){"use strict";function AccountDialogController($mdDialog,defaults,account,accountId,mailCustomFromEnabled){function customFromIsReadonly(){return accountId>0?!1:!mailCustomFromEnabled}function cancel(){$mdDialog.cancel()}function save(){$mdDialog.hide()}var vm=this;vm.defaults=defaults,vm.account=account,vm.accountId=accountId,vm.customFromIsReadonly=customFromIsReadonly,vm.cancel=cancel,vm.save=save}AccountDialogController.$inject=["$mdDialog","defaults","account","accountId","mailCustomFromEnabled"],angular.module("SOGo.PreferencesUI").controller("AccountDialogController",AccountDialogController)}(),function(){"use strict";function FiltersDialogController($scope,$mdDialog,filter,mailboxes,labels){$scope.filter=filter,$scope.mailboxes=mailboxes,$scope.labels=labels,$scope.fieldLabels={subject:l("Subject"),from:l("From"),to:l("To"),cc:l("Cc"),to_or_cc:l("To or Cc"),size:l("Size (Kb)"),header:l("Header"),body:l("Body")},$scope.methodLabels={addflag:l("Flag the message with:"),discard:l("Discard the message"),fileinto:l("File the message in:"),keep:l("Keep the message"),redirect:l("Forward the message to:"),reject:l("Send a reject message:"),vacation:l("Send a vacation message"),stop:l("Stop processing filter rules")},$scope.numberOperatorLabels={under:l("is under"),over:l("is over")},$scope.textOperatorLabels={is:l("is"),is_not:l("is not"),contains:l("contains"),contains_not:l("does not contain"),matches:l("matches"),matches_not:l("does not match"),regex:l("matches regex"),regex_not:l("does not match regex")},$scope.flagLabels={seen:l("Seen"),deleted:l("Deleted"),answered:l("Answered"),flagged:l("Flagged"),junk:l("Junk"),not_junk:l("Not Junk")},$scope.cancel=function(){$mdDialog.cancel()},$scope.save=function(){$mdDialog.hide()},$scope.addMailFilterRule=function(event){$scope.filter.rules||($scope.filter.rules=[]),$scope.filter.rules.push({})},$scope.removeMailFilterRule=function(index){$scope.filter.rules.splice(index,1)},$scope.addMailFilterAction=function(event){$scope.filter.actions||($scope.filter.actions=[]),$scope.filter.actions.push({})},$scope.removeMailFilterAction=function(index){$scope.filter.actions.splice(index,1)}}FiltersDialogController.$inject=["$scope","$mdDialog","filter","mailboxes","labels"],angular.module("SOGo.PreferencesUI").controller("FiltersDialogController",FiltersDialogController)}(),function(){"use strict";function PreferencesController($state,$mdDialog,User,Mailbox,statePreferences,Authentication){function go(module){$state.go("preferences."+module)}function addCalendarCategory(){vm.preferences.defaults.SOGoCalendarCategoriesColors["New category"]="#aaa",vm.preferences.defaults.SOGoCalendarCategories.push("New category")}function removeCalendarCategory(index){var key=vm.preferences.defaults.SOGoCalendarCategories[index];vm.preferences.defaults.SOGoCalendarCategories.splice(index,1),delete vm.preferences.defaults.SOGoCalendarCategoriesColors[key]}function addContactCategory(){vm.preferences.defaults.SOGoContactsCategories.push("")}function removeContactCategory(index){vm.preferences.defaults.SOGoContactsCategories.splice(index,1)}function addMailAccount(ev){var account;vm.preferences.defaults.AuxiliaryMailAccounts.push({}),account=_.last(vm.preferences.defaults.AuxiliaryMailAccounts),account.name=l("New account"),account.identities=[{fullName:"",email:""}],account.receipts={receiptAction:"ignore",receiptNonRecipientAction:"ignore",receiptOutsideDomainAction:"ignore",receiptAnyAction:"ignore"},$mdDialog.show({controller:"AccountDialogController",controllerAs:"$AccountDialogController",templateUrl:"editAccount?account=new",targetEvent:ev,locals:{defaults:vm.preferences.defaults,account:account,accountId:vm.preferences.defaults.AuxiliaryMailAccounts.length-1,mailCustomFromEnabled:window.mailCustomFromEnabled}})}function editMailAccount(event,index){var account=vm.preferences.defaults.AuxiliaryMailAccounts[index];$mdDialog.show({controller:"AccountDialogController",controllerAs:"$AccountDialogController",templateUrl:"editAccount?account="+index,targetEvent:event,locals:{defaults:vm.preferences.defaults,account:account,accountId:index,mailCustomFromEnabled:window.mailCustomFromEnabled}}).then(function(){vm.preferences.defaults.AuxiliaryMailAccounts[index]=account})}function removeMailAccount(index){vm.preferences.defaults.AuxiliaryMailAccounts.splice(index,1)}function addMailLabel(){vm.preferences.defaults.SOGoMailLabelsColors.new_label=["New label","#aaa"]}function removeMailLabel(key){delete vm.preferences.defaults.SOGoMailLabelsColors[key]}function addMailFilter(ev){vm.preferences.defaults.SOGoSieveFilters||(vm.preferences.defaults.SOGoSieveFilters=[]),vm.preferences.defaults.SOGoSieveFilters.push({});var filter=_.last(vm.preferences.defaults.SOGoSieveFilters);$mdDialog.show({controller:"FiltersDialogController",templateUrl:"editFilter?filter=new",targetEvent:ev,locals:{filter:filter,mailboxes:vm.mailboxes,labels:vm.preferences.defaults.SOGoMailLabelsColors}})}function editMailFilter(index){var filter=angular.copy(vm.preferences.defaults.SOGoSieveFilters[index]);$mdDialog.show({controller:"FiltersDialogController",templateUrl:"editFilter?filter="+index,targetEvent:null,locals:{filter:filter,mailboxes:vm.mailboxes,labels:vm.preferences.defaults.SOGoMailLabelsColors}}).then(function(){vm.preferences.defaults.SOGoSieveFilters[index]=filter})}function removeMailFilter(index){vm.preferences.defaults.SOGoSieveFilters.splice(index,1)}function save(){vm.preferences.$save()}function canChangePassword(){return vm.passwords.newPassword&&vm.passwords.newPassword.length>0&&vm.passwords.newPasswordConfirmation&&vm.passwords.newPasswordConfirmation.length&&vm.passwords.newPassword==vm.passwords.newPasswordConfirmation?!0:!1}function changePassword(){Authentication.changePassword(vm.passwords.newPassword).then(function(){var alert=$mdDialog.alert({title:l("Password"),content:l("The password was changed successfully."),ok:"OK"});$mdDialog.show(alert)["finally"](function(){alert=void 0})},function(msg){var alert=$mdDialog.alert({title:l("Password"),content:msg,ok:"OK"});$mdDialog.show(alert)["finally"](function(){alert=void 0})})}function timeZonesListFilter(filter){return _.filter(vm.timeZonesList,function(value){return value.toUpperCase().indexOf(filter.toUpperCase())>=0})}var vm=this;vm.preferences=statePreferences,vm.passwords={newPassword:null,newPasswordConfirmation:null},vm.go=go,vm.addCalendarCategory=addCalendarCategory,vm.removeCalendarCategory=removeCalendarCategory,vm.addContactCategory=addContactCategory,vm.removeContactCategory=removeContactCategory,vm.addMailAccount=addMailAccount,vm.editMailAccount=editMailAccount,vm.removeMailAccount=removeMailAccount,vm.addMailLabel=addMailLabel,vm.removeMailLabel=removeMailLabel,vm.addMailFilter=addMailFilter,vm.editMailFilter=editMailFilter,vm.removeMailFilter=removeMailFilter,vm.userFilter=User.$filter,vm.save=save,vm.canChangePassword=canChangePassword,vm.changePassword=changePassword,vm.timeZonesList=window.timeZonesList,vm.timeZonesListFilter=timeZonesListFilter,vm.timeZonesSearchText="",vm.mailboxes=Mailbox.$find({id:0})}PreferencesController.$inject=["$state","$mdDialog","User","Mailbox","statePreferences","Authentication"],angular.module("SOGo.PreferencesUI").controller("PreferencesController",PreferencesController)}();
//# sourceMappingURL=Preferences.js.map