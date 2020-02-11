
import './style.scss'
import App from './app/App'

document.addEventListener('DOMContentLoaded', () => {

    const $child:HTMLElement = document.createElement('div')
    $child.id = 'container'
    $child.innerHTML = `
        <div id="panel">
            <h1> Gestionnaire d'evennements </h1>
            <input type="text" class="title" placeholder="Titre">
            <input type="text" class="description" placeholder="Description (optionelle)">
            <input type="date" class="start">
            <input type="date" class="end">
            <input type="hidden" class="lat">
            <input type="hidden" class="lng">
            <input type="hidden" class="id">
            <div>
                <button type="button" class="cancel"> Annuler </button>
                <button type="button" class="submit"> Enregistrer </button>
            </div>
        </div>
        <div id="map"></div>
    `

    document.body.appendChild($child)

    var app:App = new App()

})