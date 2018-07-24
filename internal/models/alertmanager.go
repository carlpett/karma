package models

import "time"

// AlertmanagerInstance describes the Alertmanager instance alert was collected
// from
type AlertmanagerInstance struct {
	Name string `json:"name"`
	URI  string `json:"uri"`
	// per instance alert state
	State string `json:"state"`
	// timestamp collected from this instance, those on the alert itself
	// will be calculated min/max values
	StartsAt time.Time `json:"startsAt"`
	EndsAt   time.Time `json:"endsAt"`
	// Source links to alert source for given alertmanager instance
	Source string `json:"source"`
	// all silences matching current alert in this upstream, we don't export this
	// in api responses, this is used internally
	Silences map[string]*Silence `json:"-"`
	// export list of silenced IDs in api response
	SilencedBy []string `json:"silencedBy"`
	// TODO also export InhibitedBy here if it ever becomes needed
}

// AlertmanagerAPIStatus describes the Alertmanager instance overall health
type AlertmanagerAPIStatus struct {
	Name  string `json:"name"`
	URI   string `json:"uri"`
	Error string `json:"error"`
}

// AlertmanagerAPICounters returns number of Alertmanager instances in each
// state
type AlertmanagerAPICounters struct {
	Total   int `json:"total"`
	Healthy int `json:"healthy"`
	Failed  int `json:"failed"`
}

// AlertmanagerAPISummary describes the Alertmanager instance overall health
type AlertmanagerAPISummary struct {
	Counters  AlertmanagerAPICounters `json:"counters"`
	Instances []AlertmanagerAPIStatus `json:"instances"`
}
