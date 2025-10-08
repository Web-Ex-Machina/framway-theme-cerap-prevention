$(function(){
	// INTL inputs
	if (typeof intlTelInput !== "undefined") {
		var initIntlInputs = function(inputs){
			for(let i=0; i<inputs.length; i++){
				window.intlTelInput(inputs[i], {
					preferredCountries: ["fr", "gb"],
					//separateDialCode: true,
					autoPlaceholder: "aggressive",
					utilsScript: "assets/intl-tel-input/build/js/utils.js"
				});
				inputs[i].classList.add('ready')
			}
		}
		initIntlInputs(document.querySelectorAll("input[type=tel]:not(.ready)"));
		
		if ($('.splitForm input[type=tel]').length) {
			$('body').on('keyup change', '.splitForm input[type=tel]', function(e) {
				this.setCustomValidity('');
				let intl = window.intlTelInputGlobals.getInstance(this);
				if (!intl.isValidNumber()){
					this.setCustomValidity('Numéro de téléphone non valide');
					this.reportValidity()
				}
			});
		}
	}

	if ($('.tabs.wizard').length) {
		$('.tabs.wizard').each(function(){
			let tabs = $(this).tabs('get');
			tabs.reftab    = tabs.content.tabs[0].outerHTML;
			tabs.refbutton = tabs.nav.buttons[0].outerHTML;
			tabs.min = 0;
			tabs.max = 20;

			tabs.addNewTab = function(){
				if (tabs.content.tabs.length >= tabs.max)
					return false;
				let idNewTab = tabs.content.tabs.length;
				let newTab = $(tabs.reftab);
				newTab.removeClass('active');
				newTab.find('input,select,textarea').each(function(){
					let input = this;
					input.setAttribute('id',input.getAttribute('id')+'--'+idNewTab);
					input.setAttribute('name',input.getAttribute('name').replace(/_\d*$/gm,'_'+idNewTab+''));
				})
				newTab.find('select[data-select2-id]').each(function(){
					let input = this;
					input.removeAttribute('data-select2-id');
					input.classList.remove('select2-hidden-accessible');
					$(input).closest('.select2FW-wrapper').replaceWith(input);
				})
				newTab.find('label[for]').each(function(){
					this.setAttribute('for',this.getAttribute('for')+'--'+idNewTab)
				})
				
				tabs.content.$el.append($('<div></div>').html(newTab));
				newTab.unwrap()
				
				if (typeof intlTelInput !== "undefined") {
					initIntlInputs(document.querySelectorAll("input[type=tel]:not(.ready)"));
				}

				let buttonNewTab = $(tabs.refbutton);
				buttonNewTab.removeClass('active')
				buttonNewTab.find('.tab__number').html(idNewTab+1);
				buttonNewTab.attr('title',buttonNewTab.text())
				tabs.nav.$el.append(buttonNewTab);
				buttonNewTab.before(' ');

				tabs.updateTabsState()
				buttonNewTab.trigger('click');
			}

			tabs.updateTabsState = function(){
				tabs.nav.$el.find('.tabs__action').appendTo(tabs.nav.$el);
				tabs.nav.buttons = tabs.nav.$el.find('button,.nav__button').not('.exclude');
				tabs.content.tabs = tabs.content.$el.find('.tab').filter(function(){
					return $(this).closest('.tabs__content').get(0) == tabs.content.$el.get(0);
				});
			}

			tabs.removeTab = function(tab){
				if (tabs.content.tabs.length>tabs.min) {
					tab.remove();
					tabs.nav.buttons.last().remove();
					tabs.updateTabsState();
					if (!tabs.nav.$el.find('.active').length) 
						tabs.nav.buttons.last().trigger('click');
				}
			}

			tabs.$el.find('.tabs__action[data-action=addTab]').on('click',function(){
				tabs.addNewTab();
			});
			
		})
	}
	if ($('.tabs.wizard.candidate').length) {
		let tabs = $('.tabs.wizard.candidate').tabs('get');
		if ($('input[name=numberInterns]').length) {

			tabs.min = $('input[name=numberInterns]').attr('min');
			tabs.max = $('input[name=numberInterns]').attr('max');

			tabs.$el.find('.tabs__action[data-action=addTab]').on('click',function(){
				if ($('input[name=numberInterns]').val() != tabs.nav.buttons.length)
					$('input[name=numberInterns]').val(tabs.nav.buttons.length)
			});

			$('input[name=numberInterns]').on('change keyup',function(){
				if ($('input[name=numberInterns]').val() != tabs.nav.buttons.length && $('input[name=numberInterns]').val() > tabs.nav.buttons.length){
					for (var i = parseInt($('input[name=numberInterns]').val()) - tabs.nav.buttons.length; i > 0; i--) {
						tabs.addNewTab()
					}
				}

				if ($('input[name=numberInterns]').val() != tabs.nav.buttons.length && $('input[name=numberInterns]').val() < tabs.nav.buttons.length) {
					for (var i = tabs.nav.buttons.length - parseInt($('input[name=numberInterns]').val()); i > 0; i--) {
						tabs.removeTab(tabs.content.tabs.last())
					}
				}
			})
			.trigger('change');
		}
		
		if ($('input[name=candidates]').val() != "") {
			// console.log('do the tabs things');
			try{
				let candidates = JSON.parse($('input[name=candidates]').val());
				if (tabs.$el.find('.tab').length<candidates.length)
					for (let i = candidates.length - tabs.$el.find('.tab').length; i > 0; i--) {
						tabs.addNewTab();
					}
				if (tabs.$el.find('.tab').length>candidates.length)
					for (let i = tabs.$el.find('.tab').length; i > candidates.length; i--) {
						tabs.removeTab(tabs.content.tabs.last());
					}
				tabs.nav.buttons.last().trigger('click');

				for(let i in candidates){
					// console.log(i,candidates[i]);
					let currTab = tabs.content.tabs[i]
					for(let f in candidates[i]){
						// console.log(f,candidates[i][f]);
						if ($(currTab).find('[name*='+f+'_]').length) {
							if ($(currTab).find('[name*='+f+'_]').get(0).nodeName == 'INPUT') {
								switch($(currTab).find('[name*='+f+'_]').attr('type')){
									case 'tel':
									case 'email':
									case 'text': $(currTab).find('[name*='+f+'_]').val(candidates[i][f]); break;
									case 'radio':
									case 'checkbox':
										if ($(currTab).find('[name*='+f+'_][value="'+candidates[i][f]+'"]').length) 
											$(currTab).find('[name*='+f+'_][value="'+candidates[i][f]+'"]').get(0).checked = true; 
										break;
								}
							} else if($(currTab).find('[name*='+f+'_]').get(0).nodeName == 'SELECT'){
								$(currTab).find('[name*='+f+'_]').get(0).value = candidates[i][f];
								$(currTab).find('[name*='+f+'_]').trigger('change'); 
							}
							
						}
					}
				}
			} catch(e){
				console.log(e)
			}
		}

		if ($('form#inscriptionForm')) {
			if (typeof inscriptionForm_errors != "undefined") {
				let form = $('form#inscriptionForm');
				form.before('<div class="error-container block-error"></div>');
				let errContainer = form.prev('.error-container')
				
				for(let error in inscriptionForm_errors){
					if(form.find('input[name='+error+']').length){
						let input = form.find('input[name='+error+']');
						let labelError = utils.getInputLabel(input.attr('id'),input.attr('name').replace('[]', ''));
						console.log(labelError);
						let strError = 'Champ <b>'+labelError+'</b>: '+inscriptionForm_errors[error];
						if (error.split('_').length>1)
							strError = 'Champ <b>'+labelError+'</b> de <b>Candidat #'+(parseInt(error.split('_')[1])+1)+'</b>: '+inscriptionForm_errors[error];
						utils.renderError(error,strError,errContainer)
					}
				}
			}
		}
	}
});

