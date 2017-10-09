/** Reef Doctor Maps
 *
 * A simple map for displaying Reef Doctor sites on the LAN.
 *
 * Created by Jack Farley (bytesnz) 2017-07-11
 */
import 'rd-base/dist/assets/style.css';
import './style.scss';

import * as React from 'react';
import * as ReactDom from 'react-dom';

import { RDHeader } from 'rd-base';

//import species from '../../SLDataImport/species.json';
const species = require('../../SLDataImport/species.json');

import * as Fuse from 'fuse.js';

const fuseOptions = {
  shouldSort: true,
  includeScore: true,
  threshold: 0.6,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  bestScore: true,
  keys: [
    'scientificName',
    'commonNames.en',
    'commonNames.mg',
    'mappings'
  ]
};

const fishSearch = new Fuse(species, fuseOptions);

const titleCase = (str) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
const sentenceCase = (str) => str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
const deId = (str) => str.replace('-', ' ');

class App extends React.Component {
  private state = {
    results: null,
    state: null
  }

  private timer = null;

  constructor() {
    super()

    this.search = this.search.bind(this);
  }

  search(event) {
    if (event.target.value.length >= 4) {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      const value = event.target.value;
      this.timer = setTimeout((function() {
        this.timer = null;
        this.setState({state: 'loading'});
        setTimeout(() => {
          this.setState({results: fishSearch.search(value)});
          this.setState({state: 'done'});
        });
      }).bind(this), 1000);
    } else {
      this.setState({results: null});
    }
  }

  render() {
    return (
      <div>
        <RDHeader />
        <main className="small fullForm">
          <h1>Species Search</h1>
          <p>Enter a search term in the field below to look for a species</p>
          <label>
            Search term
            <input type="search" onChange={this.search}/>
          </label>
          <section>
            <h2>Results</h2>
            {(() => {
              if (this.state.results) {
                return this.state.results.map(({item, score}, index) => {
                  return (
                    <article key={index} className="species">
                      <h3>
                        {item.scientificName || ((item.commonNames && item.commonNames.en) ? item.commonNames.en[0] : item._id)}
                        {item.type ? '(' + deId(item.type) + ')' : '' }
                        <span className="note">({Math.round((1 - score) * 100)}% match)</span>
                      </h3>
                      { item.commonNames && item.commonNames.en ? (<p><b>English Name(s):</b> {item.commonNames.en.join(', ')}</p>) : '' }
                      { item.commonNames && item.commonNames.mg ? (<p><b>Malagasy Name(s):</b> {item.commonNames.mg.join(', ')}</p>) : '' }
                      { item.commonFamily ? (<p><b>Family:</b> {titleCase(item.commonFamily)}</p>) : '' }
                      { item.habitat ? (<p><b>Habitat:</b> {sentenceCase(deId(item.habitat))}</p>) : '' }
                      { item.maxLength ? (<p><b>Max length:</b> {item.maxLength}cm</p>) : '' }
                    </article>
                  );
                });
              } else if (this.state.state === 'loading') {
                return (
                  <p>Loading results...</p>
                );
              } else {
                return (
                  <p>No results</p>
                );
              }
            })()}
          </section>
        </main>
      </div>
    );
  }
}

ReactDom.render(<App />, document.getElementById('app'));
