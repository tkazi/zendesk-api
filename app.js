(function() {
  var user_email = '';
  return {
    events: {
      'userGetRequest.done': 'this.showInfo',
      'userGetRequest.fail': 'this.showError',
      'app.activated':'getInfo'
    },

   requests: {
                userGetRequest: function(email) {
                  //console.log(email)
                  return {
                    url: 'https://api.edmodo.com/users?query=' + email + '&query_full_email_only=true&access_token=',
                    type:'GET',
                    dataType: 'json'
                  };
                },
                schoolGetRequest: function(school_url) {
                  var new_url = school_url + '?access_token=';
                  //console.log(new_url);
                  return {
                    url: new_url,
                    type:'GET',
                    dataType: 'json'
                  };
                },
                districtGetRequest: function(district_url) {
                  var new_url = district_url + '?access_token=';
                  //console.log(new_url)
                  return {
                    url: new_url,
                    type:'GET',
                    dataType: 'json'
                  };
                },

    },

    getInfo: function() {
      var id = this.ticket().requester().id();
      var email = this.ticket().requester().email();
      //console.log(id, email);
      this.ajax('userGetRequest', email);
      
    },

    showInfo: function(data){
      if (Object.keys(data).length === 0) {
        data.no_user = {};
        //console.log("email does not exist")
        data.no_user['message'] = 'Email does not exist in Edmodo';
        this.switchTo('requester', data);
      }
      
      else {

        data.user = {};
        //console.log(data[0].id)
        data.user['id'] = data[0].id;
        this.switchTo('requester', data);
      
      var keys_ = (Object.keys(data[0]));      
      var key_school = (keys_.indexOf("school") > -1);
      var key_district = (keys_.indexOf("district") > -1);

      //console.log(key_school, key_district)
      //console.log(data)
    
    if (key_school){
     var school_url = data[0].school['url'];
     this.ajax('schoolGetRequest', school_url).then(
        function(school_data) {
                            console.log("school_data:", school_data);
                            data.school = {};
                            var school_subdomain = school_data.subdomain;
                            if (school_subdomain == null) {school_subdomain = 'no subdomain';}
                            data.school['name'] = school_data.name + ' (' + school_subdomain + ')' + ' (' + school_data.id + ')';
                            data.school['country'] = school_data.country_id;
                            // data.school['subdomain'] = school_data.subdomain
                            this.switchTo('requester', data);
                            },
        function() {
                   this.showError();
                   });  
   }

    if(key_district){
     var district_url = data[0].district['url'];
     this.ajax('districtGetRequest', district_url).then(
        function(district_data) {
                            data.district = {};
                            var district_subdomain = district_data.subdomain;
                            if (district_subdomain == null) {district_subdomain = 'no subdomain';}
                            console.log('district name: ', data.district['name']);
                            data.district['name'] = district_data.name + ' (' + district_subdomain + ')' +' (' + district_data.id + ')';
                            // data.district['subdomain'] = district_data.subdomain
                            this.switchTo('requester', data);
                            },
        function() {
                   this.showError();
                   });
      }
    
    }

    },

    showError: function() {
      this.switchTo('error');
    },

  };

}());