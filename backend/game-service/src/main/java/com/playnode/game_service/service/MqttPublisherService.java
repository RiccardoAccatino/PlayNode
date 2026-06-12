package com.playnode.game_service.service;

import com.playnode.game_service.entity.GiocoFisico;
import com.playnode.game_service.entity.Locale;
import com.playnode.game_service.repository.GiocoFisicoRepository;
import com.playnode.game_service.repository.LocaleRepository;
import org.eclipse.paho.client.mqttv3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MqttPublisherService {

    // Non passiamo più il brokerUrl da properties
    @Value("${mqtt.client.id}")
    private String clientIdPrefix; // È meglio usarlo come prefisso se ci connettiamo a più broker

    @Value("${mqtt.username}")
    private String mqttUsername;

    @Value("${mqtt.password}")
    private String mqttPassword;

    private final GiocoFisicoRepository giocoFisicoRepository;
    private final LocaleRepository localeRepository;

    // Cache per mantenere attive le connessioni ai vari broker locali
    private final Map<String, MqttClient> brokerClients = new ConcurrentHashMap<>();

    // Costruttore con Injection dei Repository
    public MqttPublisherService(GiocoFisicoRepository giocoFisicoRepository, LocaleRepository localeRepository) {
        this.giocoFisicoRepository = giocoFisicoRepository;
        this.localeRepository = localeRepository;
    }

    /**
     * Risale dal Gioco Fisico al Locale e restituisce l'IP/URL del broker
     */
    private String getBrokerUrlByIdGioco(Long idGiocoFisico) {
        Optional<GiocoFisico> giocoOp = giocoFisicoRepository.findById(idGiocoFisico);
        if (giocoOp.isPresent()) {
            Long localeId = giocoOp.get().getLocaleId();
            Optional<Locale> localeOp = localeRepository.findById(localeId);

            if (localeOp.isPresent()) {
                String hostBroker = localeOp.get().getHost_broker();
                // Nota: MqttClient richiede che l'url inizi con "tcp://".
                // Se nel DB salvi solo l'IP (es: "192.168.1.100"), aggiungi il prefisso e la porta qui:
                if (hostBroker != null && !hostBroker.startsWith("tcp://")) {
                    return "tcp://" + hostBroker + ":1883";
                }
                return hostBroker;
            }
        }
        return null;
    }

    /**
     * Recupera un client MQTT connesso dalla cache, o ne crea uno nuovo se non esiste
     */
    private MqttClient getMqttClient(String brokerUrl) throws MqttException {
        // Se siamo già connessi a questo broker, riutilizziamo il client
        if (brokerClients.containsKey(brokerUrl) && brokerClients.get(brokerUrl).isConnected()) {
            return brokerClients.get(brokerUrl);
        }

        // Generiamo un clientId univoco (utile in caso di riavvii o connessioni multiple)
        String uniqueClientId = clientIdPrefix + "_" + System.currentTimeMillis();
        MqttClient newClient = new MqttClient(brokerUrl, uniqueClientId);

        MqttConnectOptions options = new MqttConnectOptions();
        options.setCleanSession(true);
        options.setAutomaticReconnect(true);
        options.setUserName(mqttUsername);
        options.setPassword(mqttPassword.toCharArray());

        newClient.connect(options);
        brokerClients.put(brokerUrl, newClient); // Salviamo in cache

        System.out.println("✅ Game Service connesso a MQTT Broker: " + brokerUrl);
        return newClient;
    }

    public void inviaComandoAvvioPartita(Long ID_GIOCO_FISICO, Long idPartita) {
        String brokerUrl = getBrokerUrlByIdGioco(ID_GIOCO_FISICO);
        if (brokerUrl == null) {
            System.err.println("❌ Errore: Impossibile trovare l'host_broker per il gioco " + ID_GIOCO_FISICO);
            return;
        }

        try {
            MqttClient client = getMqttClient(brokerUrl);
            String topic = "playnode/server/comandi";
            String payload = "{\"idGiocoFisico\":" + ID_GIOCO_FISICO +",\"idPartita\":" + idPartita + "}";

            MqttMessage message = new MqttMessage(payload.getBytes());
            message.setQos(1);

            client.publish(topic, message);
            System.out.println("📤 Inviato comando MQTT: " + payload + " sul broker " + brokerUrl);
        } catch (MqttException e) {
            System.err.println("❌ Errore invio messaggio MQTT a " + brokerUrl + ": " + e.getMessage());
        }
    }

    public void inviaComandoTerminaPartita(Long idGiocoInstallato) {
        String brokerUrl = getBrokerUrlByIdGioco(idGiocoInstallato);
        if (brokerUrl == null) {
            System.err.println("❌ Errore: Impossibile trovare l'host_broker per il gioco " + idGiocoInstallato);
            return;
        }

        try {
            MqttClient client = getMqttClient(brokerUrl);
            String topic = "playnode/server/comandi";
            String payload = "{\"termina_partita\": true}";

            MqttMessage message = new MqttMessage(payload.getBytes());
            message.setQos(1);

            client.publish(topic, message);
            System.out.println("🛑 Inviato comando MQTT di FINE partita sul broker " + brokerUrl);
        } catch (MqttException e) {
            System.err.println("❌ Errore invio messaggio MQTT di terminazione a " + brokerUrl + ": " + e.getMessage());
        }
    }
}